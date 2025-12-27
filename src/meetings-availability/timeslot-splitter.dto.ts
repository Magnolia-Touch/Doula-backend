type TimeSlot = {
    startTime: Date;
    endTime: Date;
};

function toMinutes(date: Date): number {
    return date.getUTCHours() * 60 + date.getUTCMinutes();
}

function fromMinutes(baseDate: Date, minutes: number): Date {
    const d = new Date(baseDate);
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCMinutes(minutes);
    return d;
}

export function splitInto30MinSlots(
    slot: TimeSlot,
    baseDate: Date,
): TimeSlot[] {
    const slots: TimeSlot[] = [];

    let start = this.toMinutes(slot.startTime);
    const end = this.toMinutes(slot.endTime);

    while (start + 30 <= end) {
        slots.push({
            startTime: this.fromMinutes(baseDate, start),
            endTime: this.fromMinutes(baseDate, start + 30),
        });
        start += 30;
    }

    return slots;
}
