import { db } from '../client.js'
import { plans } from '../schema/subscriptions.js'
import { PLANS } from '@zenda/shared'

async function seed() {
  console.log('Seeding database...')

  // Seed plans from shared constants (single source of truth)
  const existingPlans = await db.select().from(plans)
  if (existingPlans.length === 0) {
    await db.insert(plans).values(
      Object.values(PLANS).map((p) => ({
        tier: p.tier,
        name: p.name,
        monthlyPriceCents: p.monthlyPriceCents,
        activeContactsLimit: p.activeContactsLimit,
        calendarsStaffLimit: p.calendarsStaffLimit,
        locationsLimit: p.locationsLimit,
        setupType: p.setupType,
        retentionDays: p.retentionDays,
      })),
    )
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
