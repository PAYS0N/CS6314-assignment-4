function calculateRooms(a, c) {
    const total = a + c
    return Math.ceil(total / 2)
}

$(document).ready(function() {
    $("#cruise-form").submit(function(e) {
        e.preventDefault();

        const destination = $("#destination").val();
        const departure = new Date($("#departure").val());
        const minDuration = parseInt($("#min-duration").val(), 10);
        const maxDuration = parseInt($("#max-duration").val(), 10);
        const adults = parseInt($("#adults").val(), 10);
        const children = parseInt($("#children").val(), 10);
        const infants = parseInt($("#infants").val(), 10);

        const validDestinations = ["Alaska", "Bahamas", "Europe", "Mexico"];
        const startLimit = new Date("2024-09-01");
        const endLimit = new Date("2024-12-01");

        if (!validDestinations.includes(destination)) {
            alert("Destination must be Alaska, Bahamas, Europe, or Mexico.");
            return;
        }
        else if (departure < startLimit || departure > endLimit) {
            alert("Departure must be from Sep 1, 2024 to Dec 1, 2024.");
            return
        }
        else if (minDuration < 3 || maxDuration > 10 || minDuration > maxDuration) {
            alert("Duration must be between 3 and 10 days, and max must be larger than min.");
            return;
        }
        else {
            const output = `
                Destination: ${destination}\n
                Departure: ${departure}\n
                Duration: ${minDuration} - ${maxDuration} days\n
                Adults: ${adults}, Children: ${children}, Infants: ${infants}\n
                Rooms: ${calculateRooms(adults, children)}
            `;
            $("#cruise-output").text(output);
        }
    });
});