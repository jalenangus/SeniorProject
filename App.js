import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Animated,
  Platform,
  KeyboardAvoidingView,
  Appearance,
  useColorScheme,
  FlatList,
  Easing,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";

// --- Navigation ---
const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// --- Supabase Backend ---
import { supabase } from "./supabase/client";
import { signInUser, signUpUser, signOutUser } from "./supabase/auth";

/* ---------------- THEME (Modern Light) ---------------- */

const NCAT_BLUE = "#003399";
const NCAT_BLUE_SOFT = "#2453C4";

function buildTheme(scheme) {
  // force light style but respect system if you want later
  const light = true;
  return {
    bg: "#F5F5F7", // base background like iOS settings
    surface: "#FFFFFF",
    surfaceAlt: "#F9F9FB",
    accent: NCAT_BLUE,
    accentSoft: NCAT_BLUE_SOFT,
    text: "#111827",
    muted: "#6B7280",
    border: "#E5E7EB",
    danger: "#DC2626",
    success: "#16A34A",
    pending: "#D97706",
    shadow: "#000000",
  };
}

/* ---------------- HELPERS ---------------- */

function useFadeIn(duration = 300) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
  }, []);
  return anim;
}

function PressableScale({ onPress, children, style, disabled }) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled}
      onPressIn={() =>
        Animated.spring(scale, {
          toValue: 0.97,
          useNativeDriver: true,
        }).start()
      }
      onPressOut={() =>
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }).start()
      }
      onPress={onPress}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

/* ---------------- SMALL UI COMPONENTS ---------------- */

function Tag({ label, tone = "default", theme }) {
  let bg = theme.surfaceAlt;
  let color = theme.muted;
  if (tone === "success") {
    bg = "rgba(22,163,74,0.1)";
    color = theme.success;
  } else if (tone === "danger") {
    bg = "rgba(220,38,38,0.1)";
    color = theme.danger;
  } else if (tone === "pending") {
    bg = "rgba(217,119,6,0.1)";
    color = theme.pending;
  } else if (tone === "info") {
    bg = "rgba(37,99,235,0.08)";
    color = theme.accent;
  }
  return (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      <Text style={{ color, fontSize: 11, fontWeight: "600" }}>{label}</Text>
    </View>
  );
}

function PipelineStrip({ theme }) {
  const steps = [
    "Submit Request",
    "Validate",
    "Chair Review",
    "Aggie One",
    "Complete",
  ];
  return (
    <View style={styles.pipelineStrip}>
      {steps.map((step, index) => (
        <View key={step} style={styles.pipelineStep}>
          <View
            style={[
              styles.pipelineDot,
              {
                borderColor: theme.accent,
                backgroundColor: index === 0 ? theme.accent : "#FFFFFF",
              },
            ]}
          />
          <Text
            style={[styles.pipelineLabel, { color: theme.muted }]}
            numberOfLines={1}
          >
            {step}
          </Text>
          {index < steps.length - 1 && (
            <View
              style={[
                styles.pipelineConnector,
                { borderColor: theme.border },
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );
}

/* ---------------- Header (with optional back button) ---------------- */

function AppHeader({
  title,
  subtitle,
  theme,
  right,
  showBack,
  navigation,
}) {
  return (
    <View style={styles.headerWrapper}>
      <View style={styles.headerRow}>
        {showBack && navigation ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerBackButton}
          >
            <Text style={[styles.headerBackText, { color: theme.accent }]}>
              ‹
            </Text>
          </TouchableOpacity>
        ) : null}

        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.headerTitle,
              { color: theme.text, marginLeft: showBack ? 0 : 2 },
            ]}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.headerSubtitle, { color: theme.muted }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {right ? <View style={{ marginLeft: 12 }}>{right}</View> : null}
      </View>
    </View>
  );
}

/* ---------------- LOGIN ---------------- */

function LoginScreen({ navigation, theme }) {
  const fade = useFadeIn(320);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const tryLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing information", "Enter both email and password.");
      return;
    }

    setLoading(true);
    const { data, error } = await signInUser(email.trim(), password);

    if (error) {
      setLoading(false);
      Alert.alert("Login failed", error.message);
      return;
    }

    try {
      const user = {
        id: data.user?.id ?? Date.now().toString(),
        email: data.user?.email ?? email.trim(),
        name: data.user?.user_metadata?.full_name || email.split("@")[0],
        role: "professor",
        approved: true,
      };

      await AsyncStorage.setItem("user", JSON.stringify(user));
    } catch (e) {
      console.log("Error storing user locally", e);
    }

    setLoading(false);
    Alert.alert("Success", "Welcome to Aggie One Access.");
    navigation.replace("MainApp");
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <Animated.View style={[styles.container, { opacity: fade }]}>
          <AppHeader
            title="Aggie One Access"
            subtitle="Sign in with your NCAT credentials"
            theme={theme}
            showBack={false}
            navigation={navigation}
          />

          <ScrollView
            contentContainerStyle={{ paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  shadowColor: theme.shadow,
                },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Sign in
              </Text>
              <Text style={[styles.sectionDescription, { color: theme.muted }]}>
                Access building requests, approvals, and status tracking in one
                place.
              </Text>

              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: theme.muted }]}>
                  NCAT Email
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: theme.border,
                      backgroundColor: "#FFFFFF",
                      color: theme.text,
                    },
                  ]}
                  placeholder="you@ncat.edu"
                  placeholderTextColor={theme.muted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.fieldGroup}>
                <View style={styles.row}>
                  <Text
                    style={[styles.fieldLabel, { color: theme.muted }]}
                  >
                    Password
                  </Text>
                  <Text style={{ color: theme.muted, fontSize: 11 }}>
                    At least 8 characters
                  </Text>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: theme.border,
                      backgroundColor: "#FFFFFF",
                      color: theme.text,
                    },
                  ]}
                  placeholder="••••••••"
                  placeholderTextColor={theme.muted}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <PressableScale
                onPress={tryLogin}
                disabled={loading}
                style={{ marginTop: 8 }}
              >
                <View
                  style={[
                    styles.primaryBtn,
                    {
                      backgroundColor: loading ? "#9CA3AF" : theme.accent,
                      shadowColor: theme.shadow,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.primaryBtnText,
                      { color: "#FFFFFF" },
                    ]}
                  >
                    {loading ? "Signing in…" : "Sign in"}
                  </Text>
                </View>
              </PressableScale>

              <View
                style={[
                  styles.row,
                  { marginTop: 16, justifyContent: "flex-start" },
                ]}
              >
                <Text style={{ color: theme.muted, fontSize: 13 }}>
                  Don&apos;t have an account?
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Signup")}
                >
                  <Text
                    style={[
                      styles.link,
                      { color: theme.accent, fontSize: 13 },
                    ]}
                  >
                    {" "}
                    Create one
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ marginTop: 20 }}>
              <PipelineStrip theme={theme} />
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------------- SIGNUP ---------------- */

function SignupScreen({ navigation, theme }) {
  const fade = useFadeIn(320);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const doSignup = async () => {
    if (!name || !email || !password) {
      return Alert.alert(
        "Missing information",
        "Please enter your name, NCAT email, and password."
      );
    }

    if (!isNcat(email)) {
      return Alert.alert(
        "Invalid email",
        "Aggie One Access only accepts @ncat.edu addresses."
      );
    }

    if (password.length < 8) {
      return Alert.alert(
        "Weak password",
        "Password must be at least 8 characters."
      );
    }

    setSubmitting(true);
    const { data, error } = await signUpUser(email.trim(), password);

    if (error) {
      setSubmitting(false);
      Alert.alert("Signup failed", error.message);
      return;
    }

    try {
      const newUser = {
        id: data.user?.id ?? Date.now().toString(),
        name,
        email: email.trim(),
        role: "professor",
        building: null,
        approved: false,
      };
      const usersJson = await AsyncStorage.getItem("users");
      const users = usersJson ? JSON.parse(usersJson) : [];
      users.push(newUser);
      await AsyncStorage.setItem("users", JSON.stringify(users));
    } catch (e) {
      console.log("local signup store error", e);
    }

    setSubmitting(false);
    Alert.alert(
      "Account created",
      "Your Aggie One Access account has been created. Please verify your email if required, then sign in.",
      [{ text: "Go to Login", onPress: () => navigation.replace("Login") }]
    );
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="dark-content" />
      <Animated.View style={[styles.container, { opacity: fade }]}>
        <AppHeader
          title="Create account"
          subtitle="Set up your Aggie One Access profile"
          theme={theme}
          showBack={true}
          navigation={navigation}
        />
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Basic information
            </Text>
            <Text style={[styles.sectionDescription, { color: theme.muted }]}>
              This information is used to connect you with building access
              requests and approvals.
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.muted }]}>
                Full name
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: "#FFFFFF",
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="First Last"
                placeholderTextColor={theme.muted}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.row}>
                <Text
                  style={[styles.fieldLabel, { color: theme.muted }]}
                >
                  NCAT email
                </Text>
                <Tag
                  label="@ncat.edu only"
                  tone="info"
                  theme={theme}
                />
              </View>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: "#FFFFFF",
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="you@ncat.edu"
                placeholderTextColor={theme.muted}
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.muted }]}>
                Password
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: "#FFFFFF",
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="At least 8 characters"
                placeholderTextColor={theme.muted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <PressableScale
              onPress={doSignup}
              disabled={submitting}
              style={{ marginTop: 16 }}
            >
              <View
                style={[
                  styles.primaryBtn,
                  {
                    backgroundColor: submitting ? "#9CA3AF" : theme.accent,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.primaryBtnText,
                    { color: "#FFFFFF" },
                  ]}
                >
                  {submitting ? "Creating account…" : "Create account"}
                </Text>
              </View>
            </PressableScale>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

/* ---------------- PROFILE / BUILDING ROLE ---------------- */

function BuildingRoleScreen({ navigation, theme }) {
  const fade = useFadeIn(320);
  const [building, setBuilding] = useState("");
  const [role, setRole] = useState("professor");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    (async () => {
      const uJson = await AsyncStorage.getItem("user");
      if (uJson) {
        const u = JSON.parse(uJson);
        setCurrentUser(u);
        if (u.building) setBuilding(u.building);
        if (u.role) setRole(u.role);
      }
    })();
  }, []);

  const saveProfile = async () => {
    if (!building.trim()) {
      return Alert.alert(
        "Missing building",
        "Please enter your primary building."
      );
    }
    const uJson = await AsyncStorage.getItem("user");
    const u = uJson ? JSON.parse(uJson) : null;
    if (!u) return Alert.alert("Error", "No user found.");

    const updated = { ...u, building: building.trim(), role };
    await AsyncStorage.setItem("user", JSON.stringify(updated));

    const usersJson = await AsyncStorage.getItem("users");
    let users = usersJson ? JSON.parse(usersJson) : [];
    users = users.map((us) => (us.id === updated.id ? updated : us));
    await AsyncStorage.setItem("users", JSON.stringify(users));

    Alert.alert("Profile saved", "Your profile has been updated.");
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.bg }]}>
      <Animated.View style={[styles.container, { opacity: fade }]}>
        <AppHeader
          title="Profile"
          subtitle="Role and primary building"
          theme={theme}
          showBack={true}
          navigation={navigation}
        />
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          <View
            style={[
              styles.card,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Account
            </Text>
            <Text style={[styles.sectionDescription, { color: theme.muted }]}>
              Details used to connect your requests to the appropriate building
              and approver.
            </Text>

            {currentUser && (
              <View style={{ marginTop: 8, marginBottom: 16 }}>
                <Text
                  style={{ color: theme.muted, fontSize: 12, marginBottom: 2 }}
                >
                  Signed in as
                </Text>
                <Text
                  style={{
                    color: theme.text,
                    fontWeight: "600",
                    marginBottom: 2,
                  }}
                >
                  {currentUser.name}
                </Text>
                <Text style={{ color: theme.muted }}>
                  {currentUser.email}
                </Text>
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.muted }]}>
                Primary building
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: "#FFFFFF",
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="e.g., McNair Hall"
                placeholderTextColor={theme.muted}
                value={building}
                onChangeText={setBuilding}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.muted }]}>
                Role
              </Text>
              <View style={styles.roleRow}>
                {["professor", "researcher", "admin"].map((r) => {
                  const active = role === r;
                  return (
                    <TouchableOpacity
                      key={r}
                      onPress={() => setRole(r)}
                      style={[
                        styles.roleBtn,
                        {
                          borderColor: active ? theme.accent : theme.border,
                          backgroundColor: active
                            ? "rgba(0,51,153,0.08)"
                            : "#FFFFFF",
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: active ? theme.accent : theme.text,
                          fontWeight: active ? "700" : "500",
                        }}
                      >
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <PressableScale onPress={saveProfile} style={{ marginTop: 16 }}>
              <View
                style={[
                  styles.primaryBtn,
                  { backgroundColor: theme.accent },
                ]}
              >
                <Text
                  style={[
                    styles.primaryBtnText,
                    { color: "#FFFFFF" },
                  ]}
                >
                  Save profile
                </Text>
              </View>
            </PressableScale>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

/* ---------------- REQUEST FORM ---------------- */

function RequestFormScreen({ navigation, theme }) {
  const fade = useFadeIn(320);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [building, setBuilding] = useState("");
  const [room, setRoom] = useState("");
  const [timeWindow, setTimeWindow] = useState("");
  const [semester, setSemester] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const examples = [
    {
      title: "Extended lab access",
      details:
        "Request extended key card access for senior design students after 6PM.",
      building: "McNair Hall",
      room: "Lab 220",
    },
    {
      title: "Evening study space",
      details:
        "Reserve quiet study space during finals week for ECE majors.",
      building: "Bluford Library",
      room: "3rd Floor Quiet Zone",
    },
    {
      title: "Counseling appointment block",
      details:
        "Reserve recurring appointment times for student counseling sessions.",
      building: "Murphy Hall",
      room: "Suite 120",
    },
  ];

  const applyExample = (example) => {
    setTitle(example.title);
    setDetails(example.details);
    setBuilding(example.building || "");
    setRoom(example.room || "");
  };

  const submit = async () => {
    if (!title.trim() || !details.trim() || !building.trim() || !semester.trim()) {
      return Alert.alert(
        "Incomplete request",
        "Please enter a title, building, description, and semester."
      );
    }
    setSubmitting(true);
    try {
      const uJson = await AsyncStorage.getItem("user");
      const user =
        uJson != null
          ? JSON.parse(uJson)
          : { name: "Unknown", email: "unknown@ncat.edu" };

      const request = {
        id: Date.now().toString(),
        title: title.trim(),
        details: details.trim(),
        building: building.trim(),
        room: room.trim(),
        timeWindow: timeWindow.trim(),
        semester: semester.trim(),
        name: user.name,
        email: user.email,
        status: "Pending",
        timestamp: new Date().toISOString(),
        priority: "Normal",
      };

      const reqsJson = await AsyncStorage.getItem("requests");
      const existing = reqsJson ? JSON.parse(reqsJson) : [];
      existing.unshift(request);
      await AsyncStorage.setItem("requests", JSON.stringify(existing));

      // Simulated pipeline: under review, then approved/rejected
      setTimeout(async () => {
        const r1 = (await AsyncStorage.getItem("requests")) || "[]";
        const arr1 = JSON.parse(r1);
        const updated1 = arr1.map((r) =>
          r.id === request.id ? { ...r, status: "Under review" } : r
        );
        await AsyncStorage.setItem("requests", JSON.stringify(updated1));

        setTimeout(async () => {
          const approve = Math.random() < 0.8;
          const finalStatus = approve ? "Approved" : "Rejected";
          const r2 = (await AsyncStorage.getItem("requests")) || "[]";
          const arr2 = JSON.parse(r2);
          const updated2 = arr2.map((r) =>
            r.id === request.id ? { ...r, status: finalStatus } : r
          );
          await AsyncStorage.setItem("requests", JSON.stringify(updated2));
          setSubmitting(false);

          Alert.alert(
            "Request submitted",
            "Your request has entered the review process.",
            [
              {
                text: "View requests",
                onPress: () => navigation.navigate("Requests"),
              },
              {
                text: "Back to home",
                style: "cancel",
                onPress: () => navigation.navigate("Home"),
              },
            ]
          );
        }, 2000);
      }, 1000);

      setTitle("");
      setDetails("");
      setBuilding("");
      setRoom("");
      setTimeWindow("");
      setSemester("");
    } catch (e) {
      console.log("submit error", e);
      setSubmitting(false);
      Alert.alert("Error", "Could not submit request. Please try again.");
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.bg }]}>
      <Animated.View style={[styles.container, { opacity: fade }]}>
        <AppHeader
          title="New request"
          subtitle="Submit a building access request"
          theme={theme}
          showBack={true}
          navigation={navigation}
        />
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          <View
            style={[
              styles.card,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Request details
            </Text>
            <Text style={[styles.sectionDescription, { color: theme.muted }]}>
              These fields feed into the access file for Aggie One and building
              approvers.
            </Text>

            <Text style={[styles.fieldLabel, { color: theme.muted, marginTop: 8 }]}>
              Example templates
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 4 }}
            >
              {examples.map((ex) => (
                <PressableScale
                  key={ex.title}
                  onPress={() => applyExample(ex)}
                  style={{ marginRight: 8 }}
                >
                  <View style={styles.exampleChip}>
                    <Text
                      numberOfLines={2}
                      style={{
                        color: theme.accent,
                        fontWeight: "600",
                        fontSize: 12,
                        maxWidth: 200,
                      }}
                    >
                      {ex.title}
                    </Text>
                  </View>
                </PressableScale>
              ))}
            </ScrollView>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.muted }]}>
                Title
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: "#FFFFFF",
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="Short label for this request"
                placeholderTextColor={theme.muted}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.muted }]}>
                Building
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: "#FFFFFF",
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="e.g., McNair Hall"
                placeholderTextColor={theme.muted}
                value={building}
                onChangeText={setBuilding}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.muted }]}>
                Room (optional)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: "#FFFFFF",
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="e.g., Lab 220"
                placeholderTextColor={theme.muted}
                value={room}
                onChangeText={setRoom}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.muted }]}>
                Time window (optional)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: "#FFFFFF",
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="e.g., 6PM–11PM, Mon–Thu"
                placeholderTextColor={theme.muted}
                value={timeWindow}
                onChangeText={setTimeWindow}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.muted }]}>
                Semester
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: "#FFFFFF",
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="e.g., Spring 2026"
                placeholderTextColor={theme.muted}
                value={semester}
                onChangeText={setSemester}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.muted }]}>
                Description
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: "#FFFFFF",
                    color: theme.text,
                    borderColor: theme.border,
                    minHeight: 90,
                    textAlignVertical: "top",
                  },
                ]}
                multiline
                placeholder="Describe the purpose, who needs access, and any special conditions."
                placeholderTextColor={theme.muted}
                value={details}
                onChangeText={setDetails}
              />
            </View>

            <PressableScale
              onPress={submit}
              disabled={submitting}
              style={{ marginTop: 16 }}
            >
              <View
                style={[
                  styles.primaryBtn,
                  { backgroundColor: submitting ? "#9CA3AF" : theme.accent },
                ]}
              >
                <Text
                  style={[
                    styles.primaryBtnText,
                    { color: "#FFFFFF" },
                  ]}
                >
                  {submitting ? "Submitting…" : "Submit request"}
                </Text>
              </View>
            </PressableScale>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

/* ---------------- REQUESTS HISTORY ---------------- */

function RequestsScreen({ navigation, theme }) {
  const [reqs, setReqs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    const json = await AsyncStorage.getItem("requests");
    const list = json ? JSON.parse(json) : [];
    setReqs(list);
    applyFilter(filter, list);
  };

  const applyFilter = (mode, listOverride) => {
    const base = listOverride ?? reqs;
    let out = base;
    if (mode === "pending") {
      out = base.filter(
        (r) => r.status === "Pending" || r.status === "Under review"
      );
    } else if (mode === "approved") {
      out = base.filter(
        (r) => r.status === "Approved" || r.status === "Approved by Chair"
      );
    } else if (mode === "rejected") {
      out = base.filter((r) => r.status === "Rejected");
    }
    setFilter(mode);
    setFiltered(out);
  };

  useEffect(() => {
    const unsub = navigation.addListener("focus", load);
    load();
    return unsub;
  }, [navigation]);

  const renderItem = ({ item }) => {
    let tone = "pending";
    if (item.status === "Approved" || item.status === "Approved by Chair") {
      tone = "success";
    } else if (item.status === "Rejected") {
      tone = "danger";
    }

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            marginBottom: 12,
          },
        ]}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text
            style={{
              color: theme.text,
              fontWeight: "600",
              flex: 1,
              marginRight: 8,
            }}
          >
            {item.title}
          </Text>
          <Text style={{ color: theme.muted, fontSize: 11 }}>
            {new Date(item.timestamp).toLocaleString()}
          </Text>
        </View>

        <Text
          style={{
            color: theme.muted,
            marginTop: 4,
            fontSize: 13,
          }}
        >
          {item.building}
          {item.room ? ` • ${item.room}` : ""}
        </Text>

        <Text
          style={{
            color: theme.muted,
            marginTop: 6,
            fontSize: 13,
          }}
        >
          {item.details}
        </Text>

        <View
          style={{
            marginTop: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Tag label={item.status} tone={tone} theme={theme} />
            {item.semester ? (
              <Tag
                label={item.semester}
                tone="info"
                theme={theme}
              />
            ) : null}
          </View>
          <Text style={{ color: theme.muted, fontSize: 12 }}>
            {item.name}
          </Text>
        </View>
      </View>
    );
  };

  const activeStyle = (mode) =>
    filter === mode
      ? {
          backgroundColor: "rgba(0,51,153,0.08)",
          borderColor: theme.accent,
        }
      : {
          backgroundColor: "#FFFFFF",
          borderColor: theme.border,
        };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.bg }]}>
      <Animated.View style={[styles.container, { opacity: useFadeIn(260) }]}>
        <AppHeader
          title="Requests"
          subtitle="History of submitted requests"
          theme={theme}
          showBack={true}
          navigation={navigation}
        />

        <View style={{ marginBottom: 10 }}>
          <Text
            style={{
              color: theme.muted,
              fontSize: 13,
              marginBottom: 6,
            }}
          >
            Filter by status
          </Text>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={[styles.filterChip, activeStyle("all")]}
              onPress={() => applyFilter("all")}
            >
              <Text style={{ color: theme.text, fontSize: 12 }}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, activeStyle("pending")]}
              onPress={() => applyFilter("pending")}
            >
              <Text style={{ color: theme.text, fontSize: 12 }}>Pending</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, activeStyle("approved")]}
              onPress={() => applyFilter("approved")}
            >
              <Text style={{ color: theme.text, fontSize: 12 }}>Approved</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, activeStyle("rejected")]}
              onPress={() => applyFilter("rejected")}
            >
              <Text style={{ color: theme.text, fontSize: 12 }}>Rejected</Text>
            </TouchableOpacity>
          </View>
        </View>

        {filtered.length === 0 ? (
          <Text
            style={{
              color: theme.muted,
              textAlign: "center",
              marginTop: 20,
              fontSize: 13,
            }}
          >
            No requests match this filter yet.
          </Text>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(i) => i.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

/* ---------------- ADMIN PANEL ---------------- */

function AdminPanel({ navigation, theme }) {
  const fade = useFadeIn(260);
  const [pending, setPending] = useState([]);
  const [requests, setRequests] = useState([]);
  const [banner, setBanner] = useState(null);

  const loadAll = async () => {
    const usersJson = await AsyncStorage.getItem("users");
    const users = usersJson ? JSON.parse(usersJson) : [];
    setPending(users.filter((u) => !u.approved && u.role !== "admin"));

    const reqsJson = await AsyncStorage.getItem("requests");
    const reqs = reqsJson ? JSON.parse(reqsJson) : [];
    setRequests(reqs);
  };

  useEffect(() => {
    const unsub = navigation.addListener("focus", loadAll);
    loadAll();
    return unsub;
  }, [navigation]);

  const approve = async (id) => {
    const usersJson = await AsyncStorage.getItem("users");
    let users = usersJson ? JSON.parse(usersJson) : [];
    const userToApprove = users.find((u) => u.id === id);
    users = users.map((u) => (u.id === id ? { ...u, approved: true } : u));
    await AsyncStorage.setItem("users", JSON.stringify(users));

    const reqsJson = await AsyncStorage.getItem("requests");
    let reqs = reqsJson ? JSON.parse(reqsJson) : [];
    reqs = reqs.map((r) =>
      r.email === userToApprove.email ? { ...r, status: "Approved by Chair" } : r
    );
    await AsyncStorage.setItem("requests", JSON.stringify(reqs));

    setBanner(`Approved ${userToApprove.name}`);
    setTimeout(() => setBanner(null), 2500);
    loadAll();
  };

  const totals = {
    totalRequests: requests.length,
    approved: requests.filter(
      (r) => r.status === "Approved" || r.status === "Approved by Chair"
    ).length,
    rejected: requests.filter((r) => r.status === "Rejected").length,
    pending: requests.filter(
      (r) => r.status === "Pending" || r.status === "Under review"
    ).length,
  };

  const approvalRate = totals.totalRequests
    ? Math.round((totals.approved / totals.totalRequests) * 100)
    : 0;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.bg }]}>
      {banner && (
        <View style={styles.banner}>
          <Text style={{ color: theme.accent, fontWeight: "600" }}>
            {banner}
          </Text>
        </View>
      )}
      <Animated.View style={[styles.container, { opacity: fade }]}>
        <AppHeader
          title="Admin"
          subtitle="Overview of access activity"
          theme={theme}
          showBack={true}
          navigation={navigation}
        />
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                marginBottom: 12,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Summary
            </Text>
            <Text style={[styles.sectionDescription, { color: theme.muted }]}>
              Snapshot of building access requests in the current dataset.
            </Text>

            <View style={styles.kpiRow}>
              <View style={styles.kpiCard}>
                <Text style={{ color: theme.muted, fontSize: 12 }}>
                  Total
                </Text>
                <Text style={styles.kpiValue}>{totals.totalRequests}</Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={{ color: theme.muted, fontSize: 12 }}>
                  Pending
                </Text>
                <Text style={[styles.kpiValue, { color: theme.pending }]}>
                  {totals.pending}
                </Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={{ color: theme.muted, fontSize: 12 }}>
                  Approved
                </Text>
                <Text style={[styles.kpiValue, { color: theme.success }]}>
                  {totals.approved}
                </Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={{ color: theme.muted, fontSize: 12 }}>
                  Rejected
                </Text>
                <Text style={[styles.kpiValue, { color: theme.danger }]}>
                  {totals.rejected}
                </Text>
              </View>
            </View>

            <View style={{ marginTop: 12 }}>
              <Text
                style={{
                  color: theme.muted,
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                Approval rate
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${approvalRate}%`,
                      backgroundColor: theme.accent,
                    },
                  ]}
                />
              </View>
              <Text
                style={{
                  color: theme.muted,
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                {approvalRate}% of submitted requests approved
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Pending approvals
            </Text>
            <Text style={[styles.sectionDescription, { color: theme.muted }]}>
              Users waiting for chair approval.
            </Text>

            {pending.length === 0 ? (
              <Text
                style={{
                  color: theme.muted,
                  marginTop: 12,
                  fontSize: 13,
                }}
              >
                No pending users at this time.
              </Text>
            ) : (
              pending.map((u) => (
                <View
                  key={u.id}
                  style={{
                    paddingVertical: 10,
                    borderBottomWidth: 0.5,
                    borderColor: theme.border,
                  }}
                >
                  <Text
                    style={{
                      color: theme.text,
                      fontWeight: "500",
                      marginBottom: 2,
                    }}
                  >
                    {u.name}
                  </Text>
                  <Text
                    style={{ color: theme.muted, fontSize: 13, marginBottom: 6 }}
                  >
                    {u.email}
                  </Text>
                  <PressableScale onPress={() => approve(u.id)}>
                    <View
                      style={[
                        styles.primaryBtnSmall,
                        { backgroundColor: theme.accent },
                      ]}
                    >
                      <Text
                        style={{
                          color: "#FFFFFF",
                          fontWeight: "600",
                          fontSize: 13,
                        }}
                      >
                        Approve
                      </Text>
                    </View>
                  </PressableScale>
                </View>
              ))
            )}
          </View>

          <PressableScale
            onPress={() => navigation.navigate("Requests")}
            style={{ marginTop: 16 }}
          >
            <View
              style={[
                styles.secondaryBtn,
                { borderColor: theme.border },
              ]}
            >
              <Text
                style={{
                  color: theme.accent,
                  fontWeight: "500",
                  fontSize: 14,
                }}
              >
                View full request history
              </Text>
            </View>
          </PressableScale>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

/* ---------------- HOME ---------------- */

function HomeScreen({ navigation, theme }) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const fade = useFadeIn(300);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
  });

  useEffect(() => {
    (async () => {
      const uJson = await AsyncStorage.getItem("user");
      if (uJson) setUser(JSON.parse(uJson));

      const rJson = await AsyncStorage.getItem("requests");
      const list = rJson ? JSON.parse(rJson) : [];
      const total = list.length;
      const pending = list.filter(
        (r) => r.status === "Pending" || r.status === "Under review"
      ).length;
      const approved = list.filter(
        (r) => r.status === "Approved" || r.status === "Approved by Chair"
      ).length;
      setStats({
        totalRequests: total,
        pendingRequests: pending,
        approvedRequests: approved,
      });
    })();
  }, []);

  const logout = async () => {
    await signOutUser().catch(() => {});
    await AsyncStorage.removeItem("user");
    navigation.replace("Login");
  };

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [0, -10],
    extrapolate: "clamp",
  });

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="dark-content" />
      <Animated.View style={[styles.container, { opacity: fade }]}>
        <Animated.View style={{ transform: [{ translateY: headerTranslate }] }}>
          <AppHeader
            title="Aggie One Access"
            subtitle={
              user
                ? `Welcome, ${user.name.split(" ")[0]}`
                : "Manage building access requests"
            }
            theme={theme}
            showBack={false}
            navigation={navigation}
            right={
              <TouchableOpacity onPress={() => navigation.navigate("Requests")}>
                <Text
                  style={{
                    color: theme.accent,
                    fontWeight: "500",
                    fontSize: 14,
                  }}
                >
                  Requests
                </Text>
              </TouchableOpacity>
            }
          />
        </Animated.View>

        <Animated.ScrollView
          contentContainerStyle={{ paddingBottom: 80 }}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
        >
          {/* Profile summary */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                marginBottom: 12,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Your summary
            </Text>
            <Text style={[styles.sectionDescription, { color: theme.muted }]}>
              Quick view of your activity in Aggie One Access.
            </Text>

            <View style={styles.profileRow}>
              <View style={styles.profileCircle}>
                <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>
                  {user?.name?.[0]?.toUpperCase() || "A"}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: theme.text,
                    fontWeight: "600",
                    marginBottom: 2,
                  }}
                >
                  {user?.name || "Faculty member"}
                </Text>
                <Text style={{ color: theme.muted, fontSize: 13 }}>
                  {user?.email || "you@ncat.edu"}
                </Text>
              </View>
            </View>

            <View style={styles.kpiRow}>
              <View style={styles.kpiCard}>
                <Text style={{ color: theme.muted, fontSize: 12 }}>
                  Requests
                </Text>
                <Text style={styles.kpiValue}>{stats.totalRequests}</Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={{ color: theme.muted, fontSize: 12 }}>
                  Pending
                </Text>
                <Text
                  style={[styles.kpiValue, { color: theme.pending }]}
                >
                  {stats.pendingRequests}
                </Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={{ color: theme.muted, fontSize: 12 }}>
                  Approved
                </Text>
                <Text
                  style={[styles.kpiValue, { color: theme.success }]}
                >
                  {stats.approvedRequests}
                </Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                marginBottom: 12,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Actions
            </Text>
            <Text style={[styles.sectionDescription, { color: theme.muted }]}>
              Create and review access requests, or update your profile.
            </Text>

            <PressableScale
              onPress={() => navigation.navigate("RequestForm")}
              style={{ marginTop: 12 }}
            >
              <View
                style={[
                  styles.primaryBtn,
                  {
                    backgroundColor: theme.accent,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.primaryBtnText,
                    { color: "#FFFFFF" },
                  ]}
                >
                  New request
                </Text>
              </View>
            </PressableScale>

            <PressableScale
              onPress={() => navigation.navigate("Requests")}
              style={{ marginTop: 10 }}
            >
              <View style={styles.secondaryBtn}>
                <Text
                  style={{
                    color: theme.accent,
                    fontWeight: "500",
                    fontSize: 14,
                  }}
                >
                  View requests
                </Text>
              </View>
            </PressableScale>

            <PressableScale
              onPress={() => navigation.navigate("BuildingRole")}
              style={{ marginTop: 10 }}
            >
              <View style={styles.secondaryBtn}>
                <Text
                  style={{
                    color: theme.accent,
                    fontWeight: "500",
                    fontSize: 14,
                  }}
                >
                  Edit profile
                </Text>
              </View>
            </PressableScale>

            <PressableScale onPress={logout} style={{ marginTop: 10 }}>
              <View style={styles.secondaryBtn}>
                <Text
                  style={{
                    color: theme.danger,
                    fontWeight: "500",
                    fontSize: 14,
                  }}
                >
                  Sign out
                </Text>
              </View>
            </PressableScale>
          </View>

          {/* Pipeline explanation */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              How requests move through Aggie One Access
            </Text>
            <Text style={[styles.sectionDescription, { color: theme.muted }]}>
              Requests follow a consistent process so faculty, staff, and
              students know what to expect.
            </Text>
            <PipelineStrip theme={theme} />
          </View>
        </Animated.ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

/* ---------------- APP ROOT ---------------- */

export default function App() {
  const [session, setSession] = useState(null);
  const deviceScheme = useColorScheme();
  const [scheme, setScheme] = useState(deviceScheme || "light");
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);

  // seed demo data
  useEffect(() => {
    (async () => {
      try {
        const inited = await AsyncStorage.getItem("appInitialized");
        if (!inited) {
          const demoUsers = [
            {
              id: "admin-1",
              name: "Admin User",
              email: "admin@ncat.edu",
              password: "admin123",
              role: "admin",
              building: "Admin Office",
              approved: true,
            },
            {
              id: "prof-pend-1",
              name: "Prof Demo",
              email: "prof_demo@ncat.edu",
              password: "prof123",
              role: "professor",
              building: "McNair Hall",
              approved: false,
            },
          ];
          await AsyncStorage.setItem("users", JSON.stringify(demoUsers));
          await AsyncStorage.setItem("requests", JSON.stringify([]));
          await AsyncStorage.setItem("appInitialized", "1");
        }

        const current = await AsyncStorage.getItem("user");
        setInitial(current ? "MainApp" : "Login");
      } catch (e) {
        console.log("init error", e);
        setInitial("Login");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Supabase auth session listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) =>
      setScheme(colorScheme || "light")
    );
    return () => sub.remove();
  }, []);

  const theme = buildTheme(scheme);

  if (loading) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: theme.bg }]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={{ marginTop: 10, color: theme.muted }}>
            Loading Aggie One Access…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initial}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login">
          {(props) => <LoginScreen {...props} theme={theme} />}
        </Stack.Screen>

        <Stack.Screen name="Signup">
          {(props) => <SignupScreen {...props} theme={theme} />}
        </Stack.Screen>

        <Stack.Screen name="BuildingRole">
          {(props) => <BuildingRoleScreen {...props} theme={theme} />}
        </Stack.Screen>

        <Stack.Screen name="MainApp">
          {() => (
            <Drawer.Navigator
              initialRouteName="Home"
              screenOptions={{
                headerShown: false,
                drawerStyle: {
                  backgroundColor: theme.surface,
                  width: 250,
                },
                drawerActiveTintColor: theme.accent,
                drawerInactiveTintColor: theme.muted,
              }}
            >
              <Drawer.Screen name="Home">
                {(props) => <HomeScreen {...props} theme={theme} />}
              </Drawer.Screen>

              <Drawer.Screen
                name="RequestForm"
                options={{ title: "New request" }}
              >
                {(props) => <RequestFormScreen {...props} theme={theme} />}
              </Drawer.Screen>

              <Drawer.Screen
                name="Requests"
                options={{ title: "Requests" }}
              >
                {(props) => <RequestsScreen {...props} theme={theme} />}
              </Drawer.Screen>

              <Drawer.Screen
                name="AdminPanel"
                options={{ title: "Admin" }}
              >
                {(props) => <AdminPanel {...props} theme={theme} />}
              </Drawer.Screen>

              <Drawer.Screen
                name="Profile"
                options={{ title: "Profile" }}
              >
                {(props) => <BuildingRoleScreen {...props} theme={theme} />}
              </Drawer.Screen>
            </Drawer.Navigator>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { paddingHorizontal: 18, paddingTop: 8, flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  /* Header */
  headerWrapper: {
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerBackButton: {
    paddingRight: 8,
    paddingVertical: 4,
    marginRight: 4,
  },
  headerBackText: {
    fontSize: 24,
    fontWeight: "400",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },

  /* Cards / Layout */
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    marginBottom: 8,
  },

  /* Text / Inputs */
  fieldGroup: {
    marginTop: 10,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },

  /* Buttons */
  primaryBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnSmall: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtn: {
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  primaryBtnText: {
    fontWeight: "600",
    fontSize: 15,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  link: {
    fontWeight: "500",
  },

  /* Profile */
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: NCAT_BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  /* Role buttons */
  roleRow: {
    flexDirection: "row",
    marginTop: 4,
  },
  roleBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: "center",
    marginRight: 8,
  },

  /* Tag */
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginLeft: 6,
  },

  /* Filter chips */
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
  },

  /* Pipeline */
  pipelineStrip: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    flexWrap: "nowrap",
  },
  pipelineStep: {
    flexDirection: "row",
    alignItems: "center",
  },
  pipelineDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    borderWidth: 2,
    marginRight: 4,
  },
  pipelineLabel: {
    fontSize: 11,
    maxWidth: 80,
  },
  pipelineConnector: {
    borderBottomWidth: 1,
    marginHorizontal: 6,
    width: 20,
    opacity: 0.6,
  },

  /* Example chip */
  exampleChip: {
    backgroundColor: "#EFF3FF",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 4,
  },

  /* KPI */
  kpiRow: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "space-between",
  },
  kpiCard: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 10,
    marginRight: 8,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 2,
  },

  /* Progress */
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  progressFill: {
    height: 8,
    borderRadius: 999,
  },

  /* Banner */
  banner: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
});
