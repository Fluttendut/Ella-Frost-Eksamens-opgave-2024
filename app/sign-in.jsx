import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Alert } from "react-native";
import { signIn } from "../firebase-config";
import { Stack, router } from "expo-router";

export default function SignInScreen() {
  const [email, setEmail] = useState(""); // This is a hook that stores the email entered by the user
  const [password, setPassword] = useState(""); // This is a hook that stores the password entered by the user

  // This function handles signing in the user
  const handleSignIn = async () => {
    // This tries to sign in the user
    try {
      const user = await signIn(email, password); // This signs in the user with the email and password
      // This checks if the user is signed in
      if (user) {
        // User is signed in.
        console.log(user);
        router.replace("/admin"); // This navigates to the admin screen
      }
    } catch (error) {
      // An error occurred.
      Alert.alert("Error signing in", error.message); // This displays an alert with the error message
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Sign In"
        }}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Sign In" onPress={handleSignIn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    padding: 8
  }
});