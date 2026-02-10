import { PrismaClient, Role, TimeShift, ServiceStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding started...');

    /* --------------------------------------------------
     * 1. Clean tables (order matters)
     * -------------------------------------------------- */
    await prisma.schedules.deleteMany();
    await prisma.availableSlotsForService.deleteMany();
    await prisma.servicePricing.deleteMany();
    await prisma.doulaProfile.deleteMany();
    await prisma.user.deleteMany();
    await prisma.region.deleteMany();
    await prisma.service.deleteMany();

    /* --------------------------------------------------
     * 2. Region
     * -------------------------------------------------- */
    const region = await prisma.region.create({
        data: {
            regionName: 'Kochi',
            pincode: '682001',
            district: 'Ernakulam',
            state: 'Kerala',
            country: 'India',
            latitude: '0',
            longitude: '0',
        },
    });

    /* --------------------------------------------------
     * 3. Service
     * -------------------------------------------------- */
    const service = await prisma.service.create({
        data: {
            name: 'Postpartum Care',
        },
    });

    /* --------------------------------------------------
     * 4. Helper to create doula
     * -------------------------------------------------- */
    async function createDoula(name: string) {
        const user = await prisma.user.create({
            data: {
                name,
                email: `${name.toLowerCase()}@test.com`,
                role: Role.DOULA,
            },
        });

        const profile = await prisma.doulaProfile.create({
            data: {
                userId: user.id,
                yoe: 5,
                Region: {
                    connect: { id: region.id },
                },
            },
        });

        await prisma.servicePricing.create({
            data: {
                doulaProfileId: profile.id,
                serviceId: service.id,
                price: { fullday: 1000 },
            },
        });

        return profile;
    }

    /* --------------------------------------------------
     * 5. Create Doulas
     * -------------------------------------------------- */
    const doulaA = await createDoula('DoulaA');
    const doulaB = await createDoula('DoulaB');
    const doulaC = await createDoula('DoulaC');

    /* --------------------------------------------------
     * Test Date Range
     * Example:
     * 2026-03-01 → 2026-03-10
     * Weekdays test: MONDAY, WEDNESDAY
     * -------------------------------------------------- */
    const dates = [
        '2026-03-02', // Monday
        '2026-03-04', // Wednesday
        '2026-03-09', // Monday
    ];

    /* --------------------------------------------------
     * 6. Available Slots
     * -------------------------------------------------- */

    // Doula A → available on all required weekdays
    for (const d of dates) {
        await prisma.availableSlotsForService.create({
            data: {
                doulaId: doulaA.id,
                date: new Date(d),
                availability: {
                    MORNING: true,
                    NIGHT: true,
                    FULLDAY: true,
                },
            },
        });
    }

    // Doula B → missing one weekday (should be filtered)
    await prisma.availableSlotsForService.create({
        data: {
            doulaId: doulaB.id,
            date: new Date('2026-03-02'),
            availability: {
                MORNING: true,
                NIGHT: true,
                FULLDAY: true,
            },
        },
    });

    // Doula C → available but booked
    await prisma.availableSlotsForService.create({
        data: {
            doulaId: doulaC.id,
            date: new Date('2026-03-02'),
            availability: {
                MORNING: true,
                NIGHT: true,
                FULLDAY: true,
            },
        },
    });

    await prisma.schedules.create({
        data: {
            date: new Date('2026-03-02'),
            doulaProfileId: doulaC.id,
            serviceId: service.id,
            clientId: 'dummy-client',
            bookingId: 'dummy-booking',
            status: ServiceStatus.IN_PROGRESS,
        },
    });

    console.log('✅ Seeding completed');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
