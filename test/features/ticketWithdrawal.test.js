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
