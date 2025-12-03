import "react-native-gesture-handler";
import React, { useEffect, useState, useMemo } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  ScrollView,
  Alert,
  Switch,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { supabase } from "./supabase/client";
import { signInUser, signUpUser, signOutUser } from "./supabase/auth";

const Stack = createNativeStackNavigator();

/* ------------------------------------------------------------------------- */
/*                            THEME / BASE CONSTANTS                          */
/* ------------------------------------------------------------------------- */

const COLORS = {
  background: "#F5F5F7",
  card: "#FFFFFF",
  text: "#111827",
  muted: "#6B7280",
  border: "#E5E7EB",
  primary: "#007AFF", // iOS blue
  danger: "#DC2626",
  success: "#16A34A",
  warning: "#D97706",
  info: "#2563EB",
  chipBg: "#EFF1F5",
};

const SIZES = {
  radiusLg: 16,
  radiusMd: 12,
  radiusSm: 8,
  padding: 16,
  gap: 10,
};

/* ------------------------------------------------------------------------- */
/*                               HELPER FUNCTIONS                            */
/* ------------------------------------------------------------------------- */

async function saveUserLocal(user) {
  await AsyncStorage.setItem("user", JSON.stringify(user));
}

async function loadUserLocal() {
  const json = await AsyncStorage.getItem("user");
  return json ? JSON.parse(json) : null;
}

async function clearUserLocal() {
  await AsyncStorage.removeItem("user");
}

async function loadRequestsLocal() {
  const json = await AsyncStorage.getItem("requests");
  return json ? JSON.parse(json) : [];
}

async function saveRequestsLocal(list) {
  await AsyncStorage.setItem("requests", JSON.stringify(list));
}

/* ------------------------------------------------------------------------- */
/*                          REUSABLE SMALL COMPONENTS                        */
/* ------------------------------------------------------------------------- */

function AppScreen({ children }) {
  // Wrapper for consistent background & SafeArea
  return (
    <SafeAreaView style={styles.screen}>
      {children}
    </SafeAreaView>
  );
}

function SectionCard({ title, subtitle, children, style }) {
  return (
    <View style={[styles.card, style]}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      {subtitle ? (
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      ) : null}
      {children}
    </View>
  );
}

function PrimaryButton({ label, onPress, loading, style }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.primaryBtn, style]}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.primaryBtnText}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

function SecondaryButton({ label, onPress, style, danger }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.secondaryBtn, style]}>
      <Text
        style={[
          styles.secondaryBtnText,
          danger && { color: COLORS.danger, fontWeight: "600" },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function Tag({ label, tone = "default" }) {
  let color = COLORS.muted;
  if (tone === "success") color = COLORS.success;
  if (tone === "danger") color = COLORS.danger;
  if (tone === "warning") color = COLORS.warning;
  if (tone === "info") color = COLORS.info;

  return (
    <View style={styles.tag}>
      <Text style={{ fontSize: 11, fontWeight: "600", color }}>{label}</Text>
    </View>
  );
}

function LabeledRow({ label, value, muted }) {
  return (
    <View style={styles.labeledRow}>
      <Text style={styles.labeledRowLabel}>{label}</Text>
      <Text
        style={[
          styles.labeledRowValue,
          muted && { color: COLORS.muted, fontWeight: "400" },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------------------- */
/*                               LOGIN SCREEN                                */
/* ------------------------------------------------------------------------- */

function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing info", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    const { data, error } = await signInUser(email.trim(), password);

    if (error) {
      setLoading(false);
      Alert.alert("Login failed", error.message);
      return;
    }

    const supaUser = data.user;
    const userObj = {
      id: supaUser?.id ?? Date.now().toString(),
      email: supaUser?.email ?? email.trim(),
      name: supaUser?.user_metadata?.full_name || email.split("@")[0],
      department: "Electrical & Computer Engineering",
      role: "Faculty",
    };

    await saveUserLocal(userObj);

    setLoading(false);
    navigation.replace("Home");
  };

  return (
    <AppScreen>
      <View style={styles.container}>
        <Text style={styles.appTitle}>Aggie One Access</Text>
        <Text style={styles.appSubtitle}>
          Sign in with your NCAT credentials
        </Text>

        <SectionCard
          title="Sign In"
          subtitle="Access building requests, approvals, and status."
        >
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@ncat.edu"
              placeholderTextColor={COLORS.muted}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={COLORS.muted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <PrimaryButton
            label="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: 8 }}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate("Signup")}
            style={{ marginTop: 16, alignItems: "center" }}
          >
            <Text style={styles.linkText}>
              Don&apos;t have an account?{" "}
              <Text style={{ color: COLORS.primary }}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </SectionCard>

        <SectionCard
          title="Demo accounts (for presentation)"
          subtitle="These descriptions help you explain flows in your presentation."
          style={{ marginTop: 14 }}
        >
          <Text style={styles.smallText}>
            • Faculty account: Creates and tracks building access requests.
          </Text>
          <Text style={styles.smallText}>
            • Admin account: Demonstrates approval workflow and status changes.
          </Text>
          <Text style={styles.smallText}>
            • For your demo, you can describe both roles even if you use one
            login.
          </Text>
        </SectionCard>
      </View>
    </AppScreen>
  );
}

/* ------------------------------------------------------------------------- */
/*                               SIGNUP SCREEN                               */
/* ------------------------------------------------------------------------- */

function SignupScreen({ navigation }) {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("Electrical & Computer Engineering");
  const [role, setRole] = useState("Faculty");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const doSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert("Missing info", "Please fill in all fields.");
      return;
    }

    const isNcat = (e) => !!e && e.toLowerCase().endsWith("@ncat.edu");
    if (!isNcat(email)) {
      Alert.alert("Email restriction", "Please use an @ncat.edu email.");
      return;
    }

    setLoading(true);
    const { data, error } = await signUpUser(email.trim(), password);

    if (error) {
      setLoading(false);
      Alert.alert("Signup failed", error.message);
      return;
    }

    const supaUser = data.user;
    const userObj = {
      id: supaUser?.id ?? Date.now().toString(),
      email: supaUser?.email ?? email.trim(),
      name,
      department,
      role,
    };

    await saveUserLocal(userObj);
    setLoading(false);
    Alert.alert("Success", "Account created. You are now signed in.");
    navigation.replace("Home");
  };

  return (
    <AppScreen>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.appTitle}>Create Account</Text>
        <Text style={styles.appSubtitle}>
          Aggie One Access – NCAT faculty & staff
        </Text>

        <SectionCard
          title="Sign Up"
          subtitle="Use your official @ncat.edu email to create an account."
        >
          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="First Last"
              placeholderTextColor={COLORS.muted}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Department</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Electrical & Computer Engineering"
              placeholderTextColor={COLORS.muted}
              value={department}
              onChangeText={setDepartment}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Role</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Faculty, Staff, Admin"
              placeholderTextColor={COLORS.muted}
              value={role}
              onChangeText={setRole}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>NCAT Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@ncat.edu"
              placeholderTextColor={COLORS.muted}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="At least 8 characters"
              placeholderTextColor={COLORS.muted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <PrimaryButton
            label="Create Account"
            onPress={doSignup}
            loading={loading}
            style={{ marginTop: 8 }}
          />

          <TouchableOpacity
            onPress={() => navigation.replace("Login")}
            style={{ marginTop: 16, alignItems: "center" }}
          >
            <Text style={styles.linkText}>
              Already have an account?{" "}
              <Text style={{ color: COLORS.primary }}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </SectionCard>

        <SectionCard
          title="Why @ncat.edu only?"
          subtitle="You can explain this in your presentation."
          style={{ marginTop: 14 }}
        >
          <Text style={styles.smallText}>
            • Ensures only NCAT-affiliated users submit access requests.
          </Text>
          <Text style={styles.smallText}>
            • Matches how real building systems trust campus emails.
          </Text>
        </SectionCard>
      </ScrollView>
    </AppScreen>
  );
}

/* ------------------------------------------------------------------------- */
/*                              HOME DASHBOARD                               */
/* ------------------------------------------------------------------------- */

function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const loadUserAndRequests = async () => {
    const u = await loadUserLocal();
    setUser(u);

    const list = await loadRequestsLocal();
    const total = list.length;
    const pending = list.filter(
      (r) => r.status === "Pending" || r.status === "Under Review"
    ).length;
    const approved = list.filter((r) => r.status === "Approved").length;
    const rejected = list.filter((r) => r.status === "Rejected").length;

    setStats({ total, pending, approved, rejected });
  };

  useEffect(() => {
    const unsub = navigation.addListener("focus", loadUserAndRequests);
    loadUserAndRequests();
    return unsub;
  }, [navigation]);

  const logout = async () => {
    await signOutUser().catch(() => {});
    await clearUserLocal();
    navigation.replace("Login");
  };

  return (
    <AppScreen>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.appTitle}>Aggie One Access</Text>
        <Text style={styles.appSubtitle}>
          Welcome{user ? `, ${user.name}` : ""}.
        </Text>

        {/* Profile summary */}
        <SectionCard
          title="Profile Summary"
          subtitle="Basic information attached to your access requests."
        >
          <LabeledRow
            label="Name"
            value={user?.name || "Not set"}
          />
          <LabeledRow
            label="Email"
            value={user?.email || "Not set"}
            muted
          />
          <LabeledRow
            label="Department"
            value={user?.department || "Not set"}
          />
          <LabeledRow
            label="Role"
            value={user?.role || "Not set"}
          />

          <SecondaryButton
            label="Edit Profile"
            onPress={() => navigation.navigate("Profile")}
            style={{ marginTop: 12 }}
          />
        </SectionCard>

        {/* Requests overview */}
        <SectionCard
          title="Requests Overview"
          subtitle="Snapshot of your current building access activity."
          style={{ marginTop: 14 }}
        >
          <View style={styles.row}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Total</Text>
              <Text style={styles.kpiValue}>{stats.total}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Pending</Text>
              <Text
                style={[
                  styles.kpiValue,
                  { color: COLORS.warning },
                ]}
              >
                {stats.pending}
              </Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Approved</Text>
              <Text
                style={[
                  styles.kpiValue,
                  { color: COLORS.success },
                ]}
              >
                {stats.approved}
              </Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Rejected</Text>
              <Text
                style={[
                  styles.kpiValue,
                  { color: COLORS.danger },
                ]}
              >
                {stats.rejected}
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 8 }}>
            <Text style={styles.smallText}>
              Tip for your presentation: Use these numbers to show how your app
              scales with multiple requests and how quickly you can see changes
              after admin approval.
            </Text>
          </View>
        </SectionCard>

        {/* Actions */}
        <SectionCard
          title="Quick Actions"
          subtitle="Most common actions are collected here."
          style={{ marginTop: 14 }}
        >
          <PrimaryButton
            label="New Request"
            onPress={() => navigation.navigate("RequestForm")}
          />
          <SecondaryButton
            label="View Requests"
            onPress={() => navigation.navigate("Requests")}
            style={{ marginTop: 10 }}
          />
          <SecondaryButton
            label="Admin View"
            onPress={() => navigation.navigate("Admin")}
            style={{ marginTop: 10 }}
          />
          <SecondaryButton
            label="Help & FAQ"
            onPress={() => navigation.navigate("Help")}
            style={{ marginTop: 10 }}
          />
          <SecondaryButton
            label="Settings"
            onPress={() => navigation.navigate("Settings")}
            style={{ marginTop: 10 }}
          />
          <SecondaryButton
            label="Sign Out"
            onPress={logout}
            style={{ marginTop: 10 }}
            danger
          />
        </SectionCard>   
      </ScrollView>
    </AppScreen>
  );
}

/* ------------------------------------------------------------------------- */
/*                            PROFILE SETTINGS SCREEN                        */
/* ------------------------------------------------------------------------- */

function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [office, setOffice] = useState("");
  const [hours, setHours] = useState("");

  useEffect(() => {
    (async () => {
      const u = await loadUserLocal();
      setUser(u);
      setDepartment(u?.department || "");
      setRole(u?.role || "");
      setOffice(u?.office || "");
      setHours(u?.hours || "");
    })();
  }, []);

  const saveProfile = async () => {
    if (!user) return;
    const updated = {
      ...user,
      department,
      role,
      office,
      hours,
    };
    await saveUserLocal(updated);
    Alert.alert("Saved", "Profile information updated.");
    navigation.goBack();
  };

  return (
    <AppScreen>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.appTitle}>Profile</Text>
        <Text style={styles.appSubtitle}>
          Update role and contact information associated with requests.
        </Text>

        <SectionCard title="Basic Info">
          <LabeledRow
            label="Name"
            value={user?.name || "Not set"}
          />
          <LabeledRow
            label="Email"
            value={user?.email || "Not set"}
            muted
          />
        </SectionCard>

        <SectionCard title="Academic Info" style={{ marginTop: 14 }}>
          <View style={styles.field}>
            <Text style={styles.label}>Department</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Electrical & Computer Engineering"
              placeholderTextColor={COLORS.muted}
              value={department}
              onChangeText={setDepartment}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Role</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Faculty, Staff, Admin"
              placeholderTextColor={COLORS.muted}
              value={role}
              onChangeText={setRole}
            />
          </View>
        </SectionCard>

        <SectionCard
          title="Office & Availability"
          style={{ marginTop: 14, marginBottom: 20 }}
        >
          <View style={styles.field}>
            <Text style={styles.label}>Office Location</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., McNair 220"
              placeholderTextColor={COLORS.muted}
              value={office}
              onChangeText={setOffice}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Office Hours</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Mon/Wed 2–4 PM"
              placeholderTextColor={COLORS.muted}
              value={hours}
              onChangeText={setHours}
            />
          </View>

          <PrimaryButton
            label="Save Profile"
            onPress={saveProfile}
            style={{ marginTop: 12 }}
          />
        </SectionCard>
      </ScrollView>
    </AppScreen>
  );
}

/* ------------------------------------------------------------------------- */
/*                             REQUEST FORM SCREEN                           */
/* ------------------------------------------------------------------------- */

function RequestFormScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [building, setBuilding] = useState("");
  const [room, setRoom] = useState("");
  const [details, setDetails] = useState("");
  const [category, setCategory] = useState("Lab Access");
  const [priority, setPriority] = useState("Normal");
  const [submitting, setSubmitting] = useState(false);

  const submitRequest = async () => {
    if (!title || !building || !details) {
      Alert.alert(
        "Missing info",
        "Please provide a title, building, and description."
      );
      return;
    }

    setSubmitting(true);
    const user = await loadUserLocal();

    const request = {
      id: Date.now().toString(),
      title,
      building,
      room,
      details,
      category,
      priority,
      status: "Pending",
      createdAt: new Date().toISOString(),
      createdBy: user ? user.email : "unknown@ncat.edu",
      createdByName: user ? user.name : "Unknown",
    };

    const list = await loadRequestsLocal();
    list.unshift(request);
    await saveRequestsLocal(list);

    setSubmitting(false);
    Alert.alert("Submitted", "Your request has been submitted.");
    navigation.goBack();
  };

  const applyExample = (example) => {
    setTitle(example.title);
    setBuilding(example.building);
    setRoom(example.room);
    setDetails(example.details);
    setCategory(example.category);
    setPriority(example.priority);
  };

  const examples = [
    {
      title: "Extended Senior Design Lab Access",
      building: "McNair Hall",
      room: "Lab 220",
      details:
        "Request extended badge access for senior design teams after 6PM on weekdays for the next 8 weeks.",
      category: "Lab Access",
      priority: "High",
    },
    {
      title: "Weekend Study Space",
      building: "Bluford Library",
      room: "3rd Floor Quiet Zone",
      details:
        "Reserve dedicated study area for ECE majors during midterms on Saturday and Sunday evenings.",
      category: "Study Space",
      priority: "Normal",
    },
    {
      title: "Counseling Appointment Block",
      building: "Murphy Hall",
      room: "Suite 120",
      details:
        "Set up recurring 30-minute appointment blocks for student counseling sessions on Tuesdays.",
      category: "Student Services",
      priority: "Low",
    },
  ];

  return (
    <AppScreen>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.appTitle}>New Request</Text>
        <Text style={styles.appSubtitle}>
          Submit a building, lab, or space access request.
        </Text>

        <SectionCard
          title="Templates"
          subtitle="Tap a template to quickly fill the form."
        >
          {examples.map((ex) => (
            <TouchableOpacity
              key={ex.title}
              style={styles.templateChip}
              onPress={() => applyExample(ex)}
            >
              <Text style={styles.templateTitle}>{ex.title}</Text>
              <Text style={styles.templateSubtitle}>
                {ex.building} • {ex.category}
              </Text>
            </TouchableOpacity>
          ))}
        </SectionCard>

        <SectionCard
          title="Request Details"
          style={{ marginTop: 14, marginBottom: 20 }}
        >
          <View style={styles.field}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Short title"
              placeholderTextColor={COLORS.muted}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Building</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., McNair Hall"
              placeholderTextColor={COLORS.muted}
              value={building}
              onChangeText={setBuilding}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Room (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Room 220"
              placeholderTextColor={COLORS.muted}
              value={room}
              onChangeText={setRoom}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Lab Access, Study Space"
              placeholderTextColor={COLORS.muted}
              value={category}
              onChangeText={setCategory}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Priority</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., High, Normal, Low"
              placeholderTextColor={COLORS.muted}
              value={priority}
              onChangeText={setPriority}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Details</Text>
            <TextInput
              style={[styles.input, { height: 120, textAlignVertical: "top" }]}
              placeholder="Describe who needs access, when, and why."
              placeholderTextColor={COLORS.muted}
              multiline
              value={details}
              onChangeText={setDetails}
            />
          </View>

          <PrimaryButton
            label="Submit Request"
            onPress={submitRequest}
            loading={submitting}
            style={{ marginTop: 8 }}
          />
        </SectionCard>
      </ScrollView>
    </AppScreen>
  );
}

/* ------------------------------------------------------------------------- */
/*                             REQUESTS LIST SCREEN                          */
/* ------------------------------------------------------------------------- */

function RequestsScreen() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("All");

  const loadRequests = async () => {
    const list = await loadRequestsLocal();
    setRequests(list);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "All") return requests;
    return requests.filter((r) => r.status === filter);
  }, [filter, requests]);

  const renderItem = ({ item }) => {
    let tone = "default";
    if (item.status === "Approved") tone = "success";
    if (item.status === "Rejected") tone = "danger";
    if (item.status === "Pending" || item.status === "Under Review") {
      tone = "warning";
    }

    return (
      <View style={styles.requestCard}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.requestTitle}>{item.title}</Text>
          <Tag label={item.status} tone={tone} />
        </View>
        <Text style={styles.requestMeta}>
          {item.building}
          {item.room ? ` • ${item.room}` : ""} • {item.category}
        </Text>
        <Text style={styles.requestMetaSmall}>
          Submitted by {item.createdByName || "Unknown"} on{" "}
          {new Date(item.createdAt).toLocaleString()}
        </Text>
        <Text style={styles.requestDetails}>{item.details}</Text>
        <View style={styles.requestFooter}>
          <Text style={styles.requestMetaSmall}>
            Priority: {item.priority || "Normal"}
          </Text>
        </View>
      </View>
    );
  };

  const filterOptions = ["All", "Pending", "Approved", "Rejected"];

  return (
    <AppScreen>
      <View style={[styles.container, { paddingBottom: 0 }]}>
        <Text style={styles.appTitle}>Requests</Text>
        <Text style={styles.appSubtitle}>
          Filter and review your submitted requests.
        </Text>

        <SectionCard title="Filter by status">
          <View style={styles.filterRow}>
            {filterOptions.map((opt) => {
              const active = filter === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.filterChip,
                    active && {
                      backgroundColor: "#E0ECFF",
                      borderColor: COLORS.primary,
                    },
                  ]}
                  onPress={() => setFilter(opt)}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: active ? COLORS.primary : COLORS.text,
                      fontWeight: active ? "600" : "400",
                    }}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </SectionCard>

        {filtered.length === 0 ? (
          <Text style={{ color: COLORS.muted, marginTop: 16 }}>
            No requests match this filter yet.
          </Text>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            style={{ marginTop: 10 }}
          />
        )}
      </View>
    </AppScreen>
  );
}

/* ------------------------------------------------------------------------- */
/*                                ADMIN SCREEN                               */
/* ------------------------------------------------------------------------- */

function AdminScreen() {
  const [requests, setRequests] = useState([]);

  const loadRequests = async () => {
    const list = await loadRequestsLocal();
    setRequests(list);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const toggleStatus = async (id) => {
    const updated = requests.map((r) => {
      if (r.id !== id) return r;
      if (r.status === "Pending" || r.status === "Under Review") {
        return { ...r, status: "Approved" };
      }
      if (r.status === "Approved") {
        return { ...r, status: "Rejected" };
      }
      return { ...r, status: "Pending" };
    });
    setRequests(updated);
    await saveRequestsLocal(updated);
  };

  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter(
      (r) => r.status === "Pending" || r.status === "Under Review"
    ).length;
    const approved = requests.filter((r) => r.status === "Approved").length;
    const rejected = requests.filter((r) => r.status === "Rejected").length;
    return { total, pending, approved, rejected };
  }, [requests]);

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => toggleStatus(item.id)}>
      <View style={styles.requestCard}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.requestTitle}>{item.title}</Text>
          <Tag label={item.status} />
        </View>
        <Text style={styles.requestMeta}>
          {item.building}
          {item.room ? ` • ${item.room}` : ""} • {item.category}
        </Text>
        <Text style={styles.requestMetaSmall}>
          Tap to cycle status (Pending → Approved → Rejected → Pending)
        </Text>
        <Text style={styles.requestDetails}>{item.details}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <AppScreen>
      <View style={[styles.container, { paddingBottom: 0 }]}>
        <Text style={styles.appTitle}>Admin View</Text>
        <Text style={styles.appSubtitle}>
          Demonstrates how an approver would process requests.
        </Text>

        <SectionCard title="Summary">
          <View style={styles.row}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Total</Text>
              <Text style={styles.kpiValue}>{stats.total}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Pending</Text>
              <Text
                style={[
                  styles.kpiValue,
                  { color: COLORS.warning },
                ]}
              >
                {stats.pending}
              </Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Approved</Text>
              <Text
                style={[
                  styles.kpiValue,
                  { color: COLORS.success },
                ]}
              >
                {stats.approved}
              </Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Rejected</Text>
              <Text
                style={[
                  styles.kpiValue,
                  { color: COLORS.danger },
                ]}
              >
                {stats.rejected}
              </Text>
            </View>
          </View>
        </SectionCard>

        <SectionCard
          title="Pending & Processed Requests"
          subtitle="Tap any card to cycle its status."
          style={{ marginTop: 14 }}
        >
          {requests.length === 0 ? (
            <Text style={{ color: COLORS.muted }}>
              No requests in the system yet.
            </Text>
          ) : (
            <FlatList
              data={requests}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              scrollEnabled={false}
            />
          )}
        </SectionCard>
      </View>
    </AppScreen>
  );
}

/* ------------------------------------------------------------------------- */
/*                                 HELP SCREEN                               */
/* ------------------------------------------------------------------------- */

function HelpScreen() {
  return (
    <AppScreen>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.appTitle}>Help & FAQ</Text>
        <Text style={styles.appSubtitle}>
          Use these explanations as talking points in your presentation.
        </Text>

        <SectionCard title="What problem does this solve?">
          <Text style={styles.smallText}>
            - Faculty and staff often rely on email chains or paper forms to
            request building, lab, or room access.
          </Text>
          <Text style={styles.smallText}>
            - This app centralizes those requests in a single, trackable
            system.
          </Text>
          <Text style={styles.smallText}>
            - Admins can quickly review new requests and keep status updated.
          </Text>
        </SectionCard>

        <SectionCard
          title="How does the workflow look?"
          style={{ marginTop: 14 }}
        >
          <Text style={styles.smallText}>1. User signs in with NCAT email.</Text>
          <Text style={styles.smallText}>
            2. User submits a request specifying building, room, category, and
            details.
          </Text>
          <Text style={styles.smallText}>
            3. Request is stored locally (this can be extended to Supabase
            tables).
          </Text>
          <Text style={styles.smallText}>
            4. Admin uses the Admin View to simulate approval decisions.
          </Text>
          <Text style={styles.smallText}>
            5. Status changes appear instantly in the Requests screen.
          </Text>
        </SectionCard>

        <SectionCard
          title="How could this scale?"
          style={{ marginTop: 14, marginBottom: 20 }}
        >
          <Text style={styles.smallText}>
            - Integrate with Supabase tables for persistent cloud storage.
          </Text>
          <Text style={styles.smallText}>
            - Connect to actual Aggie One access control APIs.
          </Text>
          <Text style={styles.smallText}>
            - Add email notifications when a request is approved or rejected.
          </Text>
          <Text style={styles.smallText}>
            - Add filters for specific buildings and departments.
          </Text>
        </SectionCard>
      </ScrollView>
    </AppScreen>
  );
}

/* ------------------------------------------------------------------------- */
/*                               SETTINGS SCREEN                             */
/* ------------------------------------------------------------------------- */

function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [darkModeFlag, setDarkModeFlag] = useState(false); // flag only, UI stays light

  return (
    <AppScreen>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.appTitle}>Settings</Text>
        <Text style={styles.appSubtitle}>
          These options are stored locally and can be described as future work.
        </Text>

        <SectionCard title="Preferences">
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Request Notifications</Text>
              <Text style={styles.settingSubtitle}>
                (Future work) Notify when a request is approved or rejected.
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Usage Analytics</Text>
              <Text style={styles.settingSubtitle}>
                (Future work) Aggregate stats across departments.
              </Text>
            </View>
            <Switch
              value={analyticsEnabled}
              onValueChange={setAnalyticsEnabled}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Dark Mode Flag</Text>
              <Text style={styles.settingSubtitle}>
                UI stays light for now, but this toggle reflects user
                preference.
              </Text>
            </View>
            <Switch value={darkModeFlag} onValueChange={setDarkModeFlag} />
          </View>
        </SectionCard>

        <SectionCard
          title="About This App"
          style={{ marginTop: 14, marginBottom: 20 }}
        >
          <Text style={styles.smallText}>
            - Built with React Native and Expo, targeting mobile devices.
          </Text>
          <Text style={styles.smallText}>
            - Uses AsyncStorage for local persistence of user accounts and
            requests.
          </Text>
          <Text style={styles.smallText}>
            - Supabase handles authentication and can back future database
            features.
          </Text>
        </SectionCard>
      </ScrollView>
    </AppScreen>
  );
}

/* ------------------------------------------------------------------------- */
/*                                 ROOT APP                                  */
/* ------------------------------------------------------------------------- */

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    (async () => {
      const user = await loadUserLocal();
      setInitialRoute(user ? "Home" : "Login");
    })();
  }, []);

  if (!initialRoute) {
    return (
      <AppScreen>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 8, color: COLORS.muted }}>
            Loading Aggie One Access…
          </Text>
        </View>
      </AppScreen>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.card },
          headerTitleStyle: { fontWeight: "600" },
          headerTintColor: COLORS.primary,
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: "Sign In" }}
        />
        <Stack.Screen
          name="Signup"
          component={SignupScreen}
          options={{ title: "Create Account" }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Aggie One Access" }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: "Profile" }}
        />
        <Stack.Screen
          name="RequestForm"
          component={RequestFormScreen}
          options={{ title: "New Request" }}
        />
        <Stack.Screen
          name="Requests"
          component={RequestsScreen}
          options={{ title: "Requests" }}
        />
        <Stack.Screen
          name="Admin"
          component={AdminScreen}
          options={{ title: "Admin View" }}
        />
        <Stack.Screen
          name="Help"
          component={HelpScreen}
          options={{ title: "Help & FAQ" }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: "Settings" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

/* ------------------------------------------------------------------------- */
/*                                   STYLES                                  */
/* ------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
  },
  appSubtitle: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 4,
    marginBottom: 12,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.padding,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 4,
    marginBottom: 8,
  },
  field: {
    marginTop: 10,
  },
  label: {
    fontSize: 13,
    color: COLORS.text,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#FFFFFF",
    color: COLORS.text,
    fontSize: 14,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  secondaryBtn: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  secondaryBtnText: {
    color: COLORS.primary,
    fontWeight: "500",
    fontSize: 14,
  },
  linkText: {
    fontSize: 13,
    color: COLORS.muted,
  },
  smallText: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  kpiLabel: {
    fontSize: 12,
    color: COLORS.muted,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 2,
    color: COLORS.text,
  },
  requestCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  requestTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  requestMeta: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
  },
  requestMetaSmall: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },
  requestDetails: {
    fontSize: 13,
    color: COLORS.text,
    marginTop: 6,
  },
  requestFooter: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: COLORS.chipBg,
    marginLeft: 8,
  },
  labeledRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  labeledRowLabel: {
    fontSize: 13,
    color: COLORS.muted,
  },
  labeledRowValue: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: "500",
    maxWidth: "60%",
    textAlign: "right",
  },
  templateChip: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    marginTop: 8,
    backgroundColor: "#F9FAFF",
  },
  templateTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  templateSubtitle: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: "row",
    marginTop: 4,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
    backgroundColor: "#FFFFFF",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
  },
  settingSubtitle: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
  },
});
