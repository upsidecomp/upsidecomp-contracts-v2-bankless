const { PoolEnv } = require('./support/PoolEnv')

describe('Withdraw Feature', () => {

  let env

  beforeEach(() => {
    env = new PoolEnv()
  })

  describe('instantly', () => {
    it('should should charge the exit fee when the user has no credit', async () => {
      await env.createPool({ prizePeriodSeconds: 10, creditLimit: '0.1', creditRate: '0.01', poolType: 'stake' })
      await env.setCurrentTime(5)

      await env.buyTickets({ user: 1, tickets: 100 })

      await env.withdrawInstantly({ user: 1, tickets: 100 })
      await env.expectUserToHaveTokens({ user: 1, tokens: 90 })
      await env.expectUserToHaveCredit({ user: 1, credit: 0 })
    })

    it('should allow a winner to withdraw instantly', async () => {
      await env.createPool({ prizePeriodSeconds: 10, creditLimit: '0.1', creditRate: '0.01', poolType: 'stake' })
      await env.buyTickets({ user: 1, tickets: 100 })
      await env.addRandomPrize()
      await env.awardPrize()
      await env.expectUserToHaveCredit({ user: 1, credit: '10.00' })
      await env.expectUserToHaveTickets({ user: 1, tickets: '100.0' })
      await env.withdrawInstantly({ user: 1, tickets: '100.0' })
      await env.expectUserToHaveTokens({ user: 1, tokens: '100.0' })
      // all of their credit was burned
      await env.expectUserToHaveCredit({ user: 1, credit: 0 })
    })

    it('should require the fees be paid before credit is consumed', async () => {
      await env.createPool({ prizePeriodSeconds: 10, creditLimit: '0.1', creditRate: '0.01', poolType: 'stake' })
      await env.buyTickets({ user: 1, tickets: 100 })
      await env.setCurrentTime(10)
      await env.buyTickets({ user: 1, tickets: 100 })
      await env.addRandomPrize()
      await env.awardPrize()
      await env.withdrawInstantly({ user: 1, tickets: 100 })
      // charge was taken from user
      await env.expectUserToHaveTokens({ user: 1, tokens: 90 })
      // user still has credit from first deposit
      await env.expectUserToHaveCredit({ user: 1, credit: 10 })
    })

    it('should not have withdraw fees if no credit limt', async () => {
      // invoke new pool: creditRate == 0, meaning no fees
      await env.createPool({ prizePeriodSeconds: 100, creditLimit: '0', creditRate: '0' })

      // event 1
      await env.buyTickets({ user: 1, tickets: 200 }) // user buys 200 upBANK with 200 BANK
      await env.setCurrentTime(10)
      await env.withdrawInstantly({ user: 1, tickets: 200 }) // user withdraws 200 upBANK
      await env.expectUserToHaveExactTokens({ user: 1, tokens: 200 }) // user is expected to have 200 BANK

      await env.setCurrentTime(30)

      // event 2
      await env.buyTickets({ user: 1, tickets: 100 }) // user buys 100 upBANK with 100 BANK
      await env.expectUserToHaveExactTokens({ user: 1, tokens: 100 }) // user is expected to have 100 BANK

      await env.setCurrentTime(70)

      // event 3
      await env.buyTickets({ user: 1, tickets: 100 }) // user buys another 100 upBANK with 100 BANK
      await env.expectUserToHaveExactTokens({ user: 1, tokens: 0 }) // user is expected to have 0 BANK (event 2 + event 3)

      // event 4
      await env.withdrawInstantly({ user: 1, tickets: 200 }) // // user withdraw 200 upBANK
      await env.expectUserToHaveExactTokens({ user: 1, tokens: 200 }) // // user is expected to have 200 BANK
    })


    describe('with very large amounts', () => {
      let largeAmount = '999999999999999999' // 999 quadrillion

      it('should calculate correct exit-fees at 10%', async () => {
        await env.createPool({ prizePeriodSeconds: 10, creditLimit: '0.1', creditRate: '0.01', poolType: 'stake' })
        await env.buyTickets({ user: 1, tickets: largeAmount })
        await env.addRandomPrize()
        await env.awardPrize()
        await env.withdrawInstantly({ user: 1, tickets: largeAmount })
        await env.expectUserToHaveTokens({ user: 1, tokens: largeAmount })
        // all of their credit was burned
        await env.expectUserToHaveCredit({ user: 1, credit: 0 })
      })

      it('should calculate correct exit-fees at 25%', async () => {
        await env.createPool({ prizePeriodSeconds: 10, creditLimit: '0.25', creditRate: '0.025', poolType: 'stake' })
        await env.buyTickets({ user: 1, tickets: largeAmount })
        await env.addRandomPrize()
        await env.awardPrize()
        await env.withdrawInstantly({ user: 1, tickets: largeAmount })
        await env.expectUserToHaveTokens({ user: 1, tokens: largeAmount })
        // all of their credit was burned
        await env.expectUserToHaveCredit({ user: 1, credit: 0 })
      })

      it('should calculate correct exit-fees at 37%', async () => {
        await env.createPool({ prizePeriodSeconds: 10, creditLimit: '0.37', creditRate: '0.037', poolType: 'stake' })
        await env.buyTickets({ user: 1, tickets: largeAmount })
        await env.addRandomPrize()
        await env.awardPrize()
        await env.withdrawInstantly({ user: 1, tickets: largeAmount })
        await env.expectUserToHaveTokens({ user: 1, tokens: largeAmount })
        // all of their credit was burned
        await env.expectUserToHaveCredit({ user: 1, credit: 0 })
      })

      it('should calculate correct exit-fees at 99%', async () => {
        await env.createPool({ prizePeriodSeconds: 10, creditLimit: '0.99', creditRate: '0.099', poolType: 'stake' })
        await env.buyTickets({ user: 1, tickets: largeAmount })
        await env.addRandomPrize()
        await env.awardPrize()
        await env.addRandomPrize()
        await env.withdrawInstantly({ user: 1, tickets: largeAmount })
        await env.expectUserToHaveTokens({ user: 1, tokens: largeAmount })
        // all of their credit was burned
        await env.expectUserToHaveCredit({ user: 1, credit: 0 })
      })
    })
  })
})
