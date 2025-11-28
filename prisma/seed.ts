import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // ----------------------------- USERS ------------------------------
    const adminUser = await prisma.user.create({
        data: {
            name: "Admin User",
            email: "admin@example.com",
            phone: "9999999999",
            role: "ADMIN",
        },
    });

    const zoneManagerUser = await prisma.user.create({
        data: {
            name: "Zone Manager",
            email: "zonemanager@example.com",
            phone: "8888888888",
            role: "ZONE_MANAGER",
        },
    });

    const doulaUser = await prisma.user.create({
        data: {
            name: "Doula User",
            email: "doula@example.com",
            phone: "7777777777",
            role: "DOULA",
        },
    });

    const clientUser = await prisma.user.create({
        data: {
            name: "Client User",
            email: "client@example.com",
            phone: "6666666666",
            role: "CLIENT",
        },
    });

    // ----------------------------- PROFILES ---------------------------
    const adminProfile = await prisma.adminProfile.create({
        data: { userId: adminUser.id }
    });

    const zoneManagerProfile = await prisma.zoneManagerProfile.create({
        data: { userId: zoneManagerUser.id }
    });

    const doulaProfile = await prisma.doulaProfile.create({
        data: { userId: doulaUser.id }
    });

    const clientProfile = await prisma.clientProfile.create({
        data: { userId: clientUser.id, address: "Client Address" }
    });

    // ----------------------------- REGIONS ----------------------------
    const region = await prisma.region.create({
        data: {
            regionName: "Mumbai Central",
            pincode: "400001",
            district: "Mumbai",
            state: "Maharashtra",
            country: "India",
            latitude: "18.9696",
            longitude: "72.8194",
            zoneManagerId: zoneManagerProfile.id
        }
    });

    // Assign Doula to Region
    await prisma.doulaProfile.update({
        where: { id: doulaProfile.id },
        data: {
            regionId: region.id
        }
    });

    // ----------------------------- SERVICES --------------------------
    const service1 = await prisma.service.create({
        data: {
            name: "Birth Doula Service",
            description: "Assistance during childbirth"
        }
    });

    const service2 = await prisma.service.create({
        data: {
            name: "Postpartum Care",
            description: "Support after childbirth"
        }
    });

    // ------------------------ SERVICE PRICING ------------------------
    const pricing1 = await prisma.servicePricing.create({
        data: {
            serviceId: service1.id,
            doulaProfileId: doulaProfile.id,
            price: 5000
        }
    });

    const pricing2 = await prisma.servicePricing.create({
        data: {
            serviceId: service2.id,
            doulaProfileId: doulaProfile.id,
            price: 3500
        }
    });

    // --------------------- AVAILABLE SLOTS - MEETING -----------------
    const meetingDay = await prisma.availableSlotsForMeeting.create({
        data: {
            date: new Date("2025-01-01"),
            weekday: "Monday",
            ownerRole: "DOULA",
            doulaId: doulaProfile.id
        }
    });

    const meetingSlot = await prisma.availableSlotsTimeForMeeting.create({
        data: {
            startTime: new Date("2025-01-01T10:00:00"),
            endTime: new Date("2025-01-01T11:00:00"),
            dateId: meetingDay.id
        }
    });

    // --------------------- AVAILABLE SLOTS - SERVICE ------------------
    const serviceDay = await prisma.availableSlotsForService.create({
        data: {
            date: new Date("2025-01-02"),
            weekday: "Tuesday",
            doulaId: doulaProfile.id
        }
    });

    const serviceSlot = await prisma.availableSlotsTimeForService.create({
        data: {
            startTime: new Date("2025-01-02T09:00:00"),
            endTime: new Date("2025-01-02T10:00:00"),
            dateId: serviceDay.id
        }
    });

    // ---------------------- ENQUIRY FORM ------------------------------
    const enquiry = await prisma.enquiryForm.create({
        data: {
            name: "Enquiry Example",
            email: "demo@enquiry.com",
            phone: "9991112222",
            regionId: region.id,
            slotId: meetingSlot.id,
            serviceId: service1.id
        }
    });

    // -------------------------- MEETING -------------------------------
    const meeting = await prisma.meetings.create({
        data: {
            link: "https://zoom.com/demo-meeting",
            status: "SCHEDULED",
            bookedById: clientProfile.id,
            slotId: meetingSlot.id,
            availableSlotsForMeetingId: meetingDay.id,
            doulaProfileId: doulaProfile.id,
            serviceId: service1.id
        }
    });

    // -------------------------- INTAKE FORM ---------------------------
    const intake = await prisma.intakeForm.create({
        data: {
            date: new Date(),
            address: "Client Address",
            regionId: region.id,
            servicePricingId: pricing1.id,
            doulaProfileId: doulaProfile.id,
            clientId: clientProfile.id,
            slotId: serviceDay.id,
            slotTimeId: serviceSlot.id
        }
    });

    // -------------------------- SERVICE BOOKING -----------------------
    const booking = await prisma.serviceBooking.create({
        data: {
            date: new Date(),
            paymentDetails: { status: "paid", method: "UPI" },
            regionId: region.id,
            servicePricingId: pricing2.id,
            doulaProfileId: doulaProfile.id,
            clientId: clientProfile.id,
            slotId: serviceDay.id,
            slotTimeId: serviceSlot.id
        }
    });

    // ------------------------------ NOTES ------------------------------
    await prisma.notes.create({
        data: {
            remarks: "Zone manager remark",
            zoneManagerId: zoneManagerProfile.id
        }
    });

    // --------------------------- TESTIMONIAL ---------------------------
    await prisma.testimonials.create({
        data: {
            doulaProfileId: doulaProfile.id,
            serviceId: pricing1.id,
            ratings: 5,
            reviews: "Amazing experience!",
            clientId: clientProfile.id
        }
    });

    console.log("🌱 Seeding completed!");
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
