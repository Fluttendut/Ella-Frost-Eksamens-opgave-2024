import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Button,
  Alert
} from "react-native";
import { useEffect, useState } from "react";
import { getDatabase, onValue, ref, set } from "firebase/database";
import { Stack, router, useLocalSearchParams } from "expo-router";

export default function ModalScreen() {
  const { selectedDate } = useLocalSearchParams(); // This is a hook that gets the selected date from the URL
  const [initials, setInitials] = useState(""); // This is a hook that stores the initials entered by the user
  const [bookings, setBookings] = useState([]); // This is a hook that stores the bookings from the database
  const [timeSlots, setTimeSlots] = useState([]); // This is a hook that stores the time slots for the selected date
  const [selectedSlot, setSelectedSlot] = useState(""); // This is a hook that stores the selected time slot

  // This useEffect hook fetches the bookings from the database
  useEffect(() => {
    const db = getDatabase(); // This gets the database object
    const bookingsRef = ref(db, "bookings"); // This gets the reference to the bookings collection in the database
    // This listens for changes to the bookings collection in the database
    onValue(bookingsRef, snapshot => {
      const data = snapshot.val(); // This gets the data from the snapshot
      setBookings(data ? Object.values(data) : []); // This sets the bookings hook with the data from the snapshot
    });
  }, [selectedDate]); // This hook runs when the selected date changes (selectedDate is a dependency of the useEffect hook)

  // This useEffect hook fetches/creates the time slots for the selected date
  useEffect(() => {
    if (selectedDate) {
      fetchTimeSlots(selectedDate); // This fetches/creates the time slots for the selected date
    }
  }, [selectedDate, bookings]); // This hook runs when the selected date or bookings change (selectedDate and bookings are dependencies of the useEffect hook)

  // This function fetches/creates the time slots for the selected date
  const fetchTimeSlots = date => {
    const startOfDay = new Date(date); // This creates a new Date object with the selected date
    startOfDay.setHours(0, 0, 0, 0); // This sets the time to the start of the day
    const slots = []; // This initializes an empty array to store the time slots

    // This loop creates time slots from 9am to 6pm
    for (let hour = 9; hour < 18; hour += 1) {
      const slotTime = new Date(startOfDay); // This creates a new Date object with the start of the day
      slotTime.setHours(startOfDay.getHours() + hour); // This sets the hour of the time slot
      // This checks if the time slot is in the future and not already booked
      if (slotTime > new Date()) {
        // This checks if the time slot is already booked
        const isBooked = bookings.some(
          booking => booking.startDate === slotTime.getTime()
        );
        // This adds the time slot to the array of time slots
        slots.push({
          dateTime: slotTime.getTime(),
          booked: isBooked
        });
      }
    }
    setTimeSlots(slots); // This sets the time slots hook with the array of time slots
  };

  // This function creates an event in the database
  const createEvent = async () => {
    // This checks if a time slot is selected
    if (!initials.match(/^[a-zA-Z]+$/)) {
      Alert.alert("Please enter valid initials (letters only)"); // This shows an alert if the initials are not valid
      return;
    }

    // creates an event object with the title, start date, end date, location, and initials
    const event = {
      title: `Hardware Swap Booking - ${initials}`, // This creates the title for the event
      startDate: selectedSlot.dateTime, // This creates the start date for the event
      endDate: selectedSlot.dateTime + 60 * 60 * 1000, // This creates the end date for the event
      location: "IT Department", // This creates the location for the event
      initials: initials // This creates the initials for the event
    };

    const db = getDatabase(); // This gets the database object
    const bookingId = selectedSlot.dateTime; // This creates a booking ID using the selected time slot

    const newBookingRef = ref(db, `bookings/${bookingId}`); // This gets the reference to the new booking
    set(newBookingRef, event); // This sets the data for the new booking in the database

    Alert.alert("Booking confirmed", `Booking ID: ${bookingId}`); // This shows an alert with the booking confirmation
    setInitials(""); // This resets the initials input so the user can enter new initials for the next booking
    fetchTimeSlots(selectedDate); // This fetches/creates the time slots for the selected date
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Button title="Close" onPress={() => router.back()} />
          )
        }}
      />
      <Text style={styles.title}>Add Swapp</Text>

      <View style={styles.slotContainer}>
        <Text style={styles.selectedDate}>
          {new Date(selectedDate).toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
          })}
        </Text>
        <FlatList
          style={{ width: "100%", marginBottom: 20 }}
          data={timeSlots}
          keyExtractor={item => item.dateTime}
          renderItem={({ item: slot }) => (
            <TouchableOpacity
              style={[
                styles.slot,
                slot.booked ? styles.bookedSlot : styles.availableSlot
              ]}
              disabled={slot.booked}
              onPress={() => {
                setSelectedSlot(slot);
              }}>
              <Text style={styles.slotText}>
                {new Date(slot.dateTime).toLocaleString("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true
                })}{" "}
                {slot.booked ? "Booked" : "Available"}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
      <View style={styles.inputContainer}>
        {selectedSlot && (
          <Text>
            Selected Slot:{" "}
            {new Date(selectedSlot.dateTime).toLocaleString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: true
            })}
          </Text>
        )}
        <TextInput
          style={styles.input}
          placeholder="Enter initials"
          value={initials}
          onChangeText={setInitials}
        />
        <Button title="Create Event" onPress={createEvent} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20
  },
  slotContainer: {
    width: "100%",
    paddingHorizontal: 20
  },
  selectedDate: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10
  },
  slot: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    width: "100%",
    alignItems: "center"
  },
  availableSlot: {
    backgroundColor: "green"
  },
  bookedSlot: {
    backgroundColor: "red"
  },
  slotText: {
    color: "white",
    fontWeight: "bold"
  },
  inputContainer: {
    marginTop: 20,
    width: "100%",
    paddingHorizontal: 20
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    padding: 8,
    width: "100%"
  }
});
