import {
    PrismaClient,
    MeetingStatus,
    ServiceStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

/* ------------------------------------
   Helpers
------------------------------------ */

function utcDate(year: number, month: number, day: number) {
    return new Date(Date.UTC(year, month, day, 0, 0, 0));
}

function pickActiveDays(daysInMonth: number) {
    // Pick 10–15 evenly spaced days
    const count = Math.floor(Math.random() * 6) + 10; // 10–15
    const step = Math.floor(daysInMonth / count);
    const days: number[] = [];

    let d = 1;
    while (days.length < count && d <= daysInMonth) {
        days.push(d);
        d += step || 1;
    }

    return days.slice(0, count);
}

/* ------------------------------------
   Main
------------------------------------ */

async function main() {
    console.log('🌱 Seeding multi-year Zone Manager calendar data…');

    /* ------------------------------------
       FETCH ZONE MANAGER
    ------------------------------------ */
    const zmUser = await prisma.user.findUnique({
        where: { email: 'zonemanager@test.com' },
        include: { zonemanagerprofile: true },
    });

    if (!zmUser?.zonemanagerprofile) {
        throw new Error('❌ Zone Manager not found');
    }

    const zoneManager = zmUser.zonemanagerprofile;

    /* ------------------------------------
       FETCH DOULAS UNDER ZM
    ------------------------------------ */
    const doulas = await prisma.doulaProfile.findMany({
        where: {
            zoneManager: {
                some: { id: zoneManager.id },
            },
        },
    });

    if (!doulas.length) {
        throw new Error('❌ No doulas under Zone Manager');
    }

    /* ------------------------------------
       FETCH CLIENT + SERVICE
    ------------------------------------ */
    const client = await prisma.clientProfile.findFirst();
    if (!client) throw new Error('❌ Client missing');

    const service = await prisma.service.findFirst();
    if (!service) throw new Error('❌ Service missing');

    /* ------------------------------------
       LOOP YEARS / MONTHS / DAYS
    ------------------------------------ */
    const years = [2025, 2026, 2027];

    for (const year of years) {
        for (let month = 0; month < 12; month++) {
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const activeDays = pickActiveDays(daysInMonth);

            for (let i = 0; i < activeDays.length; i++) {
                const day = activeDays[i];
                const date = utcDate(year, month, day);
                const doula = doulas[i % doulas.length];

                /* --------------------------------
                   ZONE MANAGER MEETING
                -------------------------------- */
                const zmExists = await prisma.meetings.findFirst({
                    where: {
                        zoneManagerProfileId: zoneManager.id,
                        date,
                    },
                });

                if (!zmExists) {
                    await prisma.meetings.create({
                        data: {
                            link: `https://meet.test/zm-${year}-${month + 1}-${day}`,
                            status: MeetingStatus.SCHEDULED,
                            date,
                            startTime: new Date('1970-01-01T10:00:00Z'),
                            endTime: new Date('1970-01-01T11:00:00Z'),
                            serviceName: 'Zone Manager Consultation',
                            bookedById: client.id,
                            zoneManagerProfileId: zoneManager.id,
                            serviceId: service.id,
                        },
                    });
                }

                /* --------------------------------
                   DOULA MEETING (alternate days)
                -------------------------------- */
                if (i % 2 === 0) {
                    const dmExists = await prisma.meetings.findFirst({
                        where: {
                            doulaProfileId: doula.id,
                            date,
                        },
                    });

                    if (!dmExists) {
                        await prisma.meetings.create({
                            data: {
                                link: `https://meet.test/doula-${year}-${month + 1}-${day}`,
                                status: MeetingStatus.SCHEDULED,
                                date,
                                startTime: new Date('1970-01-01T12:00:00Z'),
                                endTime: new Date('1970-01-01T13:00:00Z'),
                                serviceName: 'Doula Session',
                                bookedById: client.id,
                                doulaProfileId: doula.id,
                                serviceId: service.id,
                            },
                        });
                    }
                }

                /* --------------------------------
                   DOULA SCHEDULE (every 3rd day)
                -------------------------------- */
                if (i % 3 === 0) {
                    const pricing = await prisma.servicePricing.findFirst({
                        where: { doulaProfileId: doula.id },
                    });

                    if (!pricing) continue;

                    // 1️⃣ Find or create service booking
                    let booking = await prisma.serviceBooking.findFirst({
                        where: {
                            doulaProfileId: doula.id,
                            clientId: client.id,
                            servicePricingId: pricing.id,
                            startDate: { lte: date },
                            endDate: { gte: date },
                        },
                    });

                    if (!booking) {
                        booking = await prisma.serviceBooking.create({
                            data: {
                                startDate: date,
                                endDate: date,
                                status: 'ACTIVE',
                                doulaProfileId: doula.id,
                                clientId: client.id,
                                servicePricingId: pricing.id,
                                regionId: (
                                    await prisma.region.findFirst({
                                        where: {
                                            zoneManagerId: zoneManager.id,
                                        },
                                    })
                                )!.id,
                            },
                        });
                    }

                    // 2️⃣ Create schedule
                    const schExists = await prisma.schedules.findFirst({
                        where: {
                            doulaProfileId: doula.id,
                            date,
                        },
                    });

                    if (!schExists) {
                        await prisma.schedules.create({
                            data: {
                                date,
                                startTime: new Date('1970-01-01T09:00:00Z'),
                                endTime: new Date('1970-01-01T11:00:00Z'),
                                status: ServiceStatus.PENDING,
                                doulaProfileId: doula.id,
                                serviceId: pricing.id,
                                clientId: client.id,
                                bookingId: booking.id, // ✅ FIXED
                            },
                        });
                    }
                }
            }
        }
    }

    console.log('✅ Calendar data seeded for 2025–2027');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
