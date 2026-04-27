import { db } from '../client.js'
import { plans } from '../schema/subscriptions.js'

async function seed() {
  console.log('Seeding database...')

  // Seed plans
  const existingPlans = await db.select().from(plans)
  if (existingPlans.length === 0) {
    await db.insert(plans).values([
      {
        tier: 'starter',
        name: 'Starter',
        monthlyPriceCents: 2900,
        annualPriceCents: 28800,
        conversationsLimit: 300,
        appointmentsLimit: 150,
        voiceMinutesLimit: 120,
        staffLimit: 1,
        retentionDays: 30,
      },
      {
        tier: 'pro',
        name: 'Pro',
        monthlyPriceCents: 6900,
        annualPriceCents: 70800,
        conversationsLimit: 1000,
        appointmentsLimit: 500,
        voiceMinutesLimit: 300,
        staffLimit: 5,
        retentionDays: 90,
      },
      {
        tier: 'business',
        name: 'Business',
        monthlyPriceCents: 14900,
        annualPriceCents: 142800,
        conversationsLimit: 3000,
        appointmentsLimit: 1500,
        voiceMinutesLimit: 800,
        staffLimit: 15,
        retentionDays: 180,
      },
    ])
    console.log('Plans seeded')
  } else {
    console.log('Plans already exist, skipping')
  }

  console.log('Seed complete')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
