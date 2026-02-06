import {
    PrismaClient,
    Role,
    WeekDays,
    MeetingStatus
} from '@prisma/client';

const prisma = new PrismaClient();

const ZONE_MANAGER_ID =
    "47e356d8-cee3-40df-9fd9-94a5ca806955";

async function main() {

    /*
     -----------------------------------
     1. FIND REGION UNDER SONA
     -----------------------------------
    */

    const region = await prisma.region.findFirst({
        where: {
            zoneManagerId: ZONE_MANAGER_ID
        }
    });

    if (!region) {
        throw new Error("No region mapped to Sona zone manager");
    }

    /*
     -----------------------------------
     2. FIND SERVICE
     -----------------------------------
    */

    const service = await prisma.service.findFirst();

    if (!service) {
        throw new Error("Service not found");
    }

    /*
     -----------------------------------
     3. SLOT (MONDAY example)
     -----------------------------------
    */

    const slot = await prisma.availableSlotsForMeeting.findFirst({
        where: {
            zoneManagerId: ZONE_MANAGER_ID,
            ownerRole: Role.ZONE_MANAGER,
        }
    });

    if (!slot) {
        throw new Error("Available slot not found");
    }

    /*
     -----------------------------------
     4. CREATE CLIENTS
     -----------------------------------
    */

    const clients: Awaited<ReturnType<typeof prisma.clientProfile.create>>[] = [];

    for (let i = 0; i < 5; i++) {

        const user = await prisma.user.create({
            data: {
                name: `Test Client ${i}`,
                email: `sona-client${i}@mail.com`,
                role: Role.CLIENT
            }
        });

        const profile = await prisma.clientProfile.create({
            data: {
                userId: user.id
            }
        });

        clients.push(profile);
    }

    /*
     -----------------------------------
     5. CREATE 15 ENQUIRIES
     -----------------------------------
    */

    for (let i = 0; i < 15; i++) {

        const client = clients[i % clients.length];

        const meetingDate = new Date();
        meetingDate.setDate(meetingDate.getDate() + i);

        const enquiry = await prisma.enquiryForm.create({
            data: {
                name: `Client ${i}`,
                email: `sona-enquiry${i}@mail.com`,
                phone: `99999999${i}`,
                additionalNotes: `Enquiry for Sona ${i}`,
                meetingsDate: meetingDate,
                meetingsTimeSlots: "10:00-11:00",
                serviceName: service.name,
                regionId: region.id,
                slotId: slot.id,
                serviceId: service.id,
                clientId: client.id,
            }
        });

        await prisma.meetings.create({
            data: {
                link: "https://meet.test.com/sona",
                status: MeetingStatus.SCHEDULED,
                startTime: new Date(`${meetingDate.toISOString().split('T')[0]}T10:00:00`),
                endTime: new Date(`${meetingDate.toISOString().split('T')[0]}T11:00:00`),
                date: meetingDate,
                serviceName: service.name,
                bookedById: client.id,
                zoneManagerProfileId: ZONE_MANAGER_ID,
                enquiryId: enquiry.id
            }
        });
    }

    console.log("✅ 15 enquiries created under Sona Sasikumar");
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
