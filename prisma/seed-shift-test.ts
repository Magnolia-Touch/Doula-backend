import {
    PrismaClient,
    TimeShift,
    ServiceStatus,
    BookingStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed data for testing the shift-aware getBookedDatesInRange API.
 *
 * Doula under test:
 *   profileId: ecb57360-87e7-4006-bea5-dbf6d811276e
 *   servicePricingId: 1f958073-ac5a-417a-88e8-2a16c679731c
 *
 * Creates:
 *   - AvailableSlotsForService for March 1–15, 2026 (all shifts true)
 *   - A test ServiceBooking
 *   - Schedules on specific dates/shifts to verify cross-day logic
 *
 * Expected test results when calling GET /:doulaId/booked-dates:
 *
 * ┌──────────┬──────────────────┬───────────────────────────────────────────────────────┐
 * │ Date     │ Schedule         │ Expected availability                                 │
 * ├──────────┼──────────────────┼───────────────────────────────────────────────────────┤
 * │ Mar 1    │ (none)           │ M:✅  N:✅  F:✅                                       │
 * │ Mar 2    │ MORNING          │ M:❌  N:✅  F:❌ (same-day: fullday blocked)           │
 * │ Mar 3    │ (none)           │ M:✅  N:✅  F:✅ (morning prev-day has no impact)      │
 * │ Mar 4    │ (none)           │ M:✅  N:✅  F:✅                                       │
 * │ Mar 5    │ NIGHT            │ M:✅  N:❌  F:❌ (same-day: fullday blocked)           │
 * │ Mar 6    │ (none)           │ M:❌  N:✅  F:❌ (prev NIGHT blocks M & F)             │
 * │ Mar 7    │ (none)           │ M:✅  N:✅  F:✅                                       │
 * │ Mar 8    │ FULLDAY          │ M:❌  N:❌  F:❌ (same-day: all blocked)               │
 * │ Mar 9    │ (none)           │ M:❌  N:✅  F:❌ (prev FULLDAY blocks M & F)           │
 * │ Mar 10   │ (none)           │ M:✅  N:✅  F:✅                                       │
 * │ Mar 11   │ MORNING + NIGHT  │ M:❌  N:❌  F:❌ (both shifts + fullday blocked)       │
 * │ Mar 12   │ (none)           │ M:❌  N:✅  F:❌ (prev NIGHT blocks M & F)             │
 * │ Mar 13   │ (none)           │ M:✅  N:✅  F:✅                                       │
 * │ Mar 14   │ (none)           │ M:✅  N:✅  F:✅                                       │
 * │ Mar 15   │ (none)           │ M:✅  N:✅  F:✅                                       │
 * └──────────┴──────────────────┴───────────────────────────────────────────────────────┘
 */

const DOULA_PROFILE_ID = 'ecb57360-87e7-4006-bea5-dbf6d811276e';
const SERVICE_PRICING_ID = '1f958073-ac5a-417a-88e8-2a16c679731c';

async function main() {
    console.log('🌱 Seeding shift-test data for DoulaD...');

    /* --------------------------------------------------
     * 1. Verify doula exists
     * -------------------------------------------------- */
    const doula = await prisma.doulaProfile.findUnique({
        where: { id: DOULA_PROFILE_ID },
    });
    if (!doula) {
        throw new Error(`Doula profile ${DOULA_PROFILE_ID} not found. Aborting.`);
    }
    console.log('  ✓ Doula found');

    /* --------------------------------------------------
     * 2. Find a client & region for bookings
     * -------------------------------------------------- */
    const client = await prisma.clientProfile.findFirst();
    if (!client) {
        throw new Error('No ClientProfile found. Create a test client first.');
    }
    console.log(`  ✓ Using client: ${client.id}`);

    const region = await prisma.region.findFirst();
    if (!region) {
        throw new Error('No Region found. Create a test region first.');
    }
    console.log(`  ✓ Using region: ${region.id}`);

    /* --------------------------------------------------
     * 3. Clean up old test data for this doula in Mar 2026
     * -------------------------------------------------- */
    const rangeStart = new Date('2026-03-01');
    const rangeEnd = new Date('2026-03-15');

    // Delete schedules in range first (child of ServiceBooking)
    await prisma.schedules.deleteMany({
        where: {
            doulaProfileId: DOULA_PROFILE_ID,
            date: { gte: rangeStart, lte: rangeEnd },
        },
    });

    // Delete test bookings
    await prisma.serviceBooking.deleteMany({
        where: {
            doulaProfileId: DOULA_PROFILE_ID,
            startDate: { gte: rangeStart, lte: rangeEnd },
        },
    });

    // Delete availability slots in range
    await prisma.availableSlotsForService.deleteMany({
        where: {
            doulaId: DOULA_PROFILE_ID,
            date: { gte: rangeStart, lte: rangeEnd },
        },
    });

    console.log('  ✓ Cleaned up old test data');

    /* --------------------------------------------------
     * 4. Create availability slots (Mar 1–15, all true)
     * -------------------------------------------------- */
    const availabilityData: {
        doulaId: string;
        date: Date;
        availability: object;
    }[] = [];

    for (let day = 1; day <= 15; day++) {
        availabilityData.push({
            doulaId: DOULA_PROFILE_ID,
            date: new Date(`2026-03-${String(day).padStart(2, '0')}`),
            availability: {
                MORNING: true,
                NIGHT: true,
                FULLDAY: true,
            },
        });
    }

    await prisma.availableSlotsForService.createMany({
        data: availabilityData,
    });
    console.log('  ✓ Created 15 availability slots (Mar 1–15)');

    /* --------------------------------------------------
     * 5. Create a test ServiceBooking
     * -------------------------------------------------- */
    const booking = await prisma.serviceBooking.create({
        data: {
            startDate: rangeStart,
            endDate: rangeEnd,
            timeshift: TimeShift.FULLDAY,
            status: BookingStatus.ACTIVE,
            totalAmount: '100',
            doulaProfileId: DOULA_PROFILE_ID,
            servicePricingId: SERVICE_PRICING_ID,
            clientId: client.id,
            regionId: region.id,
        },
    });
    console.log(`  ✓ Created test booking: ${booking.id}`);

    /* --------------------------------------------------
     * 6. Create schedules for shift-constraint testing
     * -------------------------------------------------- */
    const schedulesToCreate = [
        // Mar 2: MORNING → blocks same-day FULLDAY
        {
            date: new Date('2026-03-02'),
            timeshift: TimeShift.MORNING,
            label: 'Mar 2 MORNING',
        },
        // Mar 5: NIGHT → blocks same-day FULLDAY, next-day (Mar 6) MORNING & FULLDAY
        {
            date: new Date('2026-03-05'),
            timeshift: TimeShift.NIGHT,
            label: 'Mar 5 NIGHT',
        },
        // Mar 8: FULLDAY → blocks same-day M+N, next-day (Mar 9) MORNING & FULLDAY
        {
            date: new Date('2026-03-08'),
            timeshift: TimeShift.FULLDAY,
            label: 'Mar 8 FULLDAY',
        },
        // Mar 11: MORNING + NIGHT (two schedules) → blocks all same-day + next-day effects
        {
            date: new Date('2026-03-11'),
            timeshift: TimeShift.MORNING,
            label: 'Mar 11 MORNING',
        },
        {
            date: new Date('2026-03-11'),
            timeshift: TimeShift.NIGHT,
            label: 'Mar 11 NIGHT',
        },
    ];

    for (const s of schedulesToCreate) {
        await prisma.schedules.create({
            data: {
                date: s.date,
                timeshift: s.timeshift,
                status: ServiceStatus.IN_PROGRESS,
                doulaProfileId: DOULA_PROFILE_ID,
                serviceId: SERVICE_PRICING_ID,
                clientId: client.id,
                bookingId: booking.id,
            },
        });
        console.log(`  ✓ Schedule: ${s.label}`);
    }

    /* --------------------------------------------------
     * 7. Print test guide
     * -------------------------------------------------- */
    console.log('\n✅ Seeding completed!\n');
    console.log('Test the API with these calls:\n');
    console.log(
        `  # All dates, no shift filter (default)`,
    );
    console.log(
        `  GET /v1/doula/${DOULA_PROFILE_ID}/booked-dates?startDate=2026-03-01&endDate=2026-03-15\n`,
    );
    console.log(`  # MORNING shift only`);
    console.log(
        `  GET /v1/doula/${DOULA_PROFILE_ID}/booked-dates?startDate=2026-03-01&endDate=2026-03-15&shift=MORNING\n`,
    );
    console.log(`  # NIGHT shift only`);
    console.log(
        `  GET /v1/doula/${DOULA_PROFILE_ID}/booked-dates?startDate=2026-03-01&endDate=2026-03-15&shift=NIGHT\n`,
    );
    console.log(`  # FULLDAY shift only`);
    console.log(
        `  GET /v1/doula/${DOULA_PROFILE_ID}/booked-dates?startDate=2026-03-01&endDate=2026-03-15&shift=FULLDAY\n`,
    );
    console.log('Expected MORNING booked dates: Mar 2, 6, 8, 9, 11, 12');
    console.log('Expected NIGHT   booked dates: Mar 5, 8, 11');
    console.log('Expected FULLDAY booked dates: Mar 2, 5, 6, 8, 9, 11, 12');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
