import { ContractKit } from '@celo/contractkit'
import {
  authenticateUser,
  CombinerEndpoint,
  ErrorType,
  getSignerEndpoint,
  hasValidAccountParam,
  hasValidBlindedPhoneNumberParam,
  identifierIsValidIfExists,
  isBodyReasonablySized,
  LegacySignMessageResponse,
  LegacySignMessageResponseFailure,
  LegacySignMessageResponseSchema,
  LegacySignMessageResponseSuccess,
  PnpQuotaStatus,
  send,
  SignerEndpoint,
  SignMessageRequest,
  SignMessageRequestSchema,
  WarningMessage,
} from '@celo/phone-number-privacy-common'
import Logger from 'bunyan'
import { Request, Response } from 'express'
import * as t from 'io-ts'
import { BLSCryptographyClient } from '../../../common/crypto-clients/bls-crypto-client'
import { CryptoSession } from '../../../common/crypto-session'
import { IO } from '../../../common/io'
import { OdisConfig, VERSION } from '../../../config'

export class LegacyPnpSignIO extends IO<SignMessageRequest> {
  readonly endpoint: CombinerEndpoint = CombinerEndpoint.LEGACY_PNP_SIGN
  readonly signerEndpoint: SignerEndpoint = getSignerEndpoint(this.endpoint)
  readonly requestSchema: t.Type<
    SignMessageRequest,
    SignMessageRequest,
    unknown
  > = SignMessageRequestSchema
  readonly responseSchema: t.Type<
    LegacySignMessageResponse,
    LegacySignMessageResponse,
    unknown
  > = LegacySignMessageResponseSchema

  constructor(readonly config: OdisConfig, readonly kit: ContractKit) {
    super(config)
  }

  async init(
    request: Request<{}, {}, unknown>,
    response: Response<LegacySignMessageResponse>
  ): Promise<CryptoSession<SignMessageRequest> | null> {
    if (!super.inputChecks(request, response)) {
      return null
    }
    if (!this.requestHasValidKeyVersion(request, response.locals.logger)) {
      this.sendFailure(WarningMessage.INVALID_KEY_VERSION_REQUEST, 400, response)
      return null
    }
    if (!(await this.authenticate(request, response.locals.logger))) {
      this.sendFailure(WarningMessage.UNAUTHENTICATED_USER, 401, response)
      return null
    }
    return new CryptoSession(request, response, new BLSCryptographyClient(this.config))
  }

  validateClientRequest(
    request: Request<{}, {}, unknown>
  ): request is Request<{}, {}, SignMessageRequest> {
    return (
      super.validateClientRequest(request) &&
      hasValidAccountParam(request.body) &&
      hasValidBlindedPhoneNumberParam(request.body) &&
      identifierIsValidIfExists(request.body) &&
      isBodyReasonablySized(request.body)
    )
  }

  async authenticate(
    request: Request<{}, {}, SignMessageRequest>,
    logger: Logger
  ): Promise<boolean> {
    return authenticateUser(request, this.kit, logger, this.config.shouldFailOpen)
  }

  sendSuccess(
    status: number,
    response: Response<LegacySignMessageResponseSuccess>,
    signature: string,
    quotaStatus: PnpQuotaStatus,
    warnings: string[]
  ) {
    send(
      response,
      {
        success: true,
        version: VERSION,
        signature,
        ...quotaStatus,
        warnings,
      },
      status,
      response.locals.logger
    )
  }

  sendFailure(
    error: ErrorType,
    status: number,
    response: Response<LegacySignMessageResponseFailure>,
    signature?: string,
    quotaStatus?: PnpQuotaStatus
  ) {
    send(
      response,
      {
        success: false,
        version: VERSION,
        error,
        signature,
        ...quotaStatus,
      },
      status,
      response.locals.logger
    )
  }
}
