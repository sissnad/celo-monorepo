import { ErrorMessage, OdisRequest, OdisResponse } from '@celo/phone-number-privacy-common'
import { Request, Response } from 'express'
import { Action } from './action'
import { Counters, Histograms, meter } from './metrics'

export class Controller<R extends OdisRequest> {
  constructor(readonly action: Action<R>) {}

  public async handle(
    request: Request<{}, {}, unknown>,
    response: Response<OdisResponse<R>>
  ): Promise<void> {
    Counters.requests.labels(this.action.io.endpoint).inc()
    // Unique error to be thrown on timeout
    const timeoutError = Symbol()
    await meter(
      async () => {
        const session = await this.action.io.init(request, response)
        // Init returns a response to the user internally.
        if (session) {
          await this.action.perform(session, timeoutError)
        }
      },
      [],
      (err: any) => {
        // TODO EN: can reduce duplication here a bit more (i.e. just change error)
        // TODO EN: can consider adding generic DB error handling here
        if (err === timeoutError) {
          Counters.timeouts.inc()
          this.action.io.sendFailure(ErrorMessage.TIMEOUT_FROM_SIGNER, 500, response)
          return
        }
        response.locals.logger.error(
          { err },
          `Unknown error in handler for ${this.action.io.endpoint}`
        )
        this.action.io.sendFailure(ErrorMessage.UNKNOWN_ERROR, 500, response)
      },
      Histograms.responseLatency,
      [this.action.io.endpoint]
    )
  }
}
