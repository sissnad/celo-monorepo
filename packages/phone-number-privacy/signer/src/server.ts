import { timeout } from '@celo/base'
import { ContractKit } from '@celo/contractkit'
import {
  ErrorMessage,
  getContractKit,
  loggerMiddleware,
  rootLogger,
  SignerEndpoint,
} from '@celo/phone-number-privacy-common'
import Logger from 'bunyan'
import express, { Request, Response } from 'express'
import fs from 'fs'
import https from 'https'
import { Knex } from 'knex'
import * as PromClient from 'prom-client'
import { Controller } from './common/controller'
import { KeyProvider } from './common/key-management/key-provider-base'
import { Counters } from './common/metrics'
import { getVersion, SignerConfig } from './config'
import { DomainDisableAction } from './domain/endpoints/disable/action'
import { DomainDisableIO } from './domain/endpoints/disable/io'
import { DomainQuotaAction } from './domain/endpoints/quota/action'
import { DomainQuotaIO } from './domain/endpoints/quota/io'
import { DomainSignAction } from './domain/endpoints/sign/action'
import { DomainSignIO } from './domain/endpoints/sign/io'
import { DomainQuotaService } from './domain/services/quota'
import { PnpQuotaAction } from './pnp/endpoints/quota/action'
import { PnpQuotaIO } from './pnp/endpoints/quota/io'
import { PnpSignAction } from './pnp/endpoints/sign/action'
import { PnpSignIO } from './pnp/endpoints/sign/io'
import { LegacyPnpQuotaService } from './pnp/services/quota.legacy'
import { OnChainPnpQuotaService } from './pnp/services/quota.onchain'

require('events').EventEmitter.defaultMaxListeners = 15

export function startSigner(
  config: SignerConfig,
  db: Knex,
  keyProvider: KeyProvider,
  kit?: ContractKit
) {
  const logger = rootLogger(config.serviceName)

  kit = kit ?? getContractKit(config.blockchain)

  logger.info('Creating signer express server')
  const app = express()
  app.use(express.json({ limit: '0.2mb' }), loggerMiddleware(config.serviceName))

  app.get(SignerEndpoint.STATUS, (_req, res) => {
    res.status(200).json({
      version: getVersion(),
    })
  })

  app.get(SignerEndpoint.METRICS, (_req, res) => {
    res.send(PromClient.register.metrics())
  })

  const addEndpointWithTimeout = (
    endpoint: SignerEndpoint,
    handler: (req: Request, res: Response) => Promise<void>
  ) =>
    app.post(endpoint, async (req, res) => {
      const childLogger: Logger = res.locals.logger
      const timeoutRes = Symbol()
      try {
        // TODO(2.0.0, timeout) https://github.com/celo-org/celo-monorepo/issues/9845
        await timeout(handler, [req, res], config.timeout, timeoutRes)
      } catch (err: any) {
        // Handle any errors that otherwise managed to escape the proper handlers
        let errorMsg: string = ErrorMessage.UNKNOWN_ERROR
        let errToLog = err
        if (err === timeoutRes) {
          Counters.timeouts.inc()
          errorMsg = ErrorMessage.TIMEOUT_FROM_SIGNER
          errToLog = new Error(errorMsg)
        }
        childLogger.error({ errToLog })
        if (!res.writableEnded) {
          res.status(500).json({
            success: false,
            error: errorMsg,
          })
        } else {
          // TODO(2.0.0, timeout) https://github.com/celo-org/celo-monorepo/issues/9845
          // TODO(2.0.0, audit responses) https://github.com/celo-org/celo-monorepo/issues/9859
          // getting to this error indicates that either timeout or `perform` process
          // does not terminate after sending a response, and then throws an error.
          childLogger.error('Error in endpoint thrown after response was already sent')
        }
        throw new Error(errToLog)
      }
    })

  const pnpQuotaService = new OnChainPnpQuotaService(db, kit)
  const legacyPnpQuotaService = new LegacyPnpQuotaService(db, kit)
  const domainQuotaService = new DomainQuotaService(db)

  const pnpQuota = new Controller(
    new PnpQuotaAction(
      config,
      pnpQuotaService,
      new PnpQuotaIO(
        config.api.phoneNumberPrivacy.enabled,
        config.api.phoneNumberPrivacy.shouldFailOpen, // TODO(2.0.0) (https://github.com/celo-org/celo-monorepo/issues/9862) consider refactoring config to make the code cleaner
        kit
      )
    )
  )
  const pnpSign = new Controller(
    new PnpSignAction(
      db,
      config,
      pnpQuotaService,
      keyProvider,
      new PnpSignIO(
        config.api.phoneNumberPrivacy.enabled,
        config.api.phoneNumberPrivacy.shouldFailOpen,
        kit
      )
    )
  )
  const legacyPnpSign = new Controller(
    new PnpSignAction(
      db,
      config,
      legacyPnpQuotaService,
      keyProvider,
      new PnpSignIO(
        config.api.phoneNumberPrivacy.enabled,
        config.api.phoneNumberPrivacy.shouldFailOpen,
        kit
      )
    )
  )
  const legacyPnpQuota = new Controller(
    new PnpQuotaAction(
      config,
      legacyPnpQuotaService,
      new PnpQuotaIO(
        config.api.phoneNumberPrivacy.enabled,
        config.api.phoneNumberPrivacy.shouldFailOpen,
        kit
      )
    )
  )
  const domainQuota = new Controller(
    new DomainQuotaAction(config, domainQuotaService, new DomainQuotaIO(config.api.domains.enabled))
  )
  const domainSign = new Controller(
    new DomainSignAction(
      db,
      config,
      domainQuotaService,
      keyProvider,
      new DomainSignIO(config.api.domains.enabled)
    )
  )
  const domainDisable = new Controller(
    new DomainDisableAction(db, config, new DomainDisableIO(config.api.domains.enabled))
  )
  logger.info('Right before adding meteredSignerEndpoints')
  addEndpointWithTimeout(SignerEndpoint.PNP_SIGN, pnpSign.handle.bind(pnpSign))
  addEndpointWithTimeout(SignerEndpoint.PNP_QUOTA, pnpQuota.handle.bind(pnpQuota))
  addEndpointWithTimeout(SignerEndpoint.DOMAIN_QUOTA_STATUS, domainQuota.handle.bind(domainQuota))
  addEndpointWithTimeout(SignerEndpoint.DOMAIN_SIGN, domainSign.handle.bind(domainSign))
  addEndpointWithTimeout(SignerEndpoint.DISABLE_DOMAIN, domainDisable.handle.bind(domainDisable))

  addEndpointWithTimeout(SignerEndpoint.LEGACY_PNP_SIGN, legacyPnpSign.handle.bind(legacyPnpSign))
  addEndpointWithTimeout(
    SignerEndpoint.LEGACY_PNP_QUOTA,
    legacyPnpQuota.handle.bind(legacyPnpQuota)
  )

  const sslOptions = getSslOptions(config)
  if (sslOptions) {
    return https.createServer(sslOptions, app)
  } else {
    return app
  }
}

function getSslOptions(config: SignerConfig) {
  const logger = rootLogger(config.serviceName)
  const { sslKeyPath, sslCertPath } = config.server

  if (!sslKeyPath || !sslCertPath) {
    logger.info('No SSL configs specified')
    return null
  }

  if (!fs.existsSync(sslKeyPath) || !fs.existsSync(sslCertPath)) {
    logger.error('SSL cert files not found')
    return null
  }

  return {
    key: fs.readFileSync(sslKeyPath),
    cert: fs.readFileSync(sslCertPath),
  }
}
