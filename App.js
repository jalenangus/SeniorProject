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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { createDrawerNavigator } from "@react-navigation/drawer";
const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

/* ---------------- THEME (Luxury) ---------------- */
function buildTheme(scheme) {
  const dark = scheme !== "light";
  return {
    bg: dark ? "#030308" : "#0b0b0b",
    panel: dark ? "#0b0c0f" : "#111214",
    neon: "#00ffd5", // subtle neon accent
    gold: "#FFD700", // luxury gold
    goldMuted: "#E6C26B",
    text: "#E8EEF6",
    muted: "#9AA4B2",
    border: "#1b1f26",
    card: dark ? "#0f1216" : "#101214",
  };
}

/* ---------------- HELPERS ---------------- */
function useFadeIn(duration = 420) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }).start();
  }, []);
  return anim;
}
function PressableScale({ onPress, children, style }) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={() => Animated.spring(scale, { toValue: 0.975, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
      onPress={onPress}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style]}>{children}</Animated.View>
    </TouchableOpacity>
  );
}

/* ---------------- Header (used with parallax) ---------------- */
function AppHeader({ title, subtitle, theme, right, scrollY }) {
  // parallax: shrink title slightly as scrollY increases
  const scale = scrollY ? scrollY.interpolate({ inputRange: [0, 120], outputRange: [1, 0.92], extrapolate: "clamp" }) : 1;
  const translateY = scrollY ? scrollY.interpolate({ inputRange: [0, 120], outputRange: [0, -6], extrapolate: "clamp" }) : 0;

  return (
    <Animated.View style={[styles.headerRow, { transform: [{ scale }, { translateY }], borderBottomWidth: 0 }]}>
      <View style={[styles.logoBox, { backgroundColor: theme.panel, shadowColor: theme.gold }]}>
        <Text style={[styles.logoText, { color: theme.gold }]}>A</Text>
      </View>
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.headerSubtitle, { color: theme.muted }]}>{subtitle}</Text> : null}
      </View>
      {right ? <View style={{ justifyContent: "center" }}>{right}</View> : null}
    </Animated.View>
  );
}

/* ---------------- LOGIN ---------------- */
function LoginScreen({ navigation, theme }) {
  const fade = useFadeIn(420);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const tryLogin = async () => {
    if (!email.trim() || !password) return Alert.alert("Please enter both email and password.");
    try {
      const usersJson = await AsyncStorage.getItem("users");
      const users = usersJson ? JSON.parse(usersJson) : [];
      const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (!found) return Alert.alert("Login failed", "Incorrect credentials or account not found.");

      await AsyncStorage.setItem("user", JSON.stringify(found));
      if (found.role === "admin") navigation.replace("AdminPanel");
      else navigation.replace("Home");
    } catch (e) {
      console.log("login error", e);
      Alert.alert("Error", "Could not log in.");
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <Animated.View style={[styles.container, { opacity: fade }]}>
          <AppHeader title="Aggie One Access — Premium" subtitle="Sign in with your NCAT account" theme={theme} />
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.gold }]}>Welcome back</Text>
            <Text style={[styles.hint, { color: theme.muted }]}>Secure sign-in • enterprise access</Text>

            <TextInput
              style={[styles.input, { borderColor: theme.border, backgroundColor: "#0b0b0b", color: theme.text }]}
              placeholder="NCAT email"
              placeholderTextColor={theme.muted}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={[styles.input, { borderColor: theme.border, backgroundColor: "#0b0b0b", color: theme.text }]}
              placeholder="Password"
              placeholderTextColor={theme.muted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <PressableScale onPress={tryLogin} style={{ marginTop: 12 }}>
              <View style={[styles.primaryBtn, { backgroundColor: theme.gold }]}>
                <Text style={[styles.primaryBtnText, { color: "#071014" }]}>Sign in</Text>
              </View>
            </PressableScale>

            <View style={[styles.row, { marginTop: 10 }]}>
              <Text style={{ color: theme.muted }}>No account yet?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                <Text style={[styles.link, { color: theme.gold }]}>Create one</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------------- SIGNUP ---------------- */
function SignupScreen({ navigation, theme }) {
  const fade = useFadeIn(420);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isNcat = (e) => !!e && e.toLowerCase().endsWith("@ncat.edu");

  const doSignup = async () => {
    if (!name || !email || !password) return Alert.alert("All fields required.");
    if (!isNcat(email)) return Alert.alert("Please use an @ncat.edu email.");

    const usersJson = await AsyncStorage.getItem("users");
    const users = usersJson ? JSON.parse(usersJson) : [];
    if (users.some((u) => u.email === email)) return Alert.alert("Account exists.");

    const newUser = { id: Date.now().toString(), name, email, password, building: null, role: "professor", approved: false };
    users.push(newUser);
    await AsyncStorage.setItem("users", JSON.stringify(users));
    await AsyncStorage.setItem("user", JSON.stringify(newUser));
    navigation.replace("BuildingRole");
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.bg }]}>
      <Animated.View style={[styles.container, { opacity: fade }]}>
        <AppHeader title="Aggie One Access — Register" subtitle="Create an enterprise account" theme={theme} />
        <ScrollView contentContainerStyle={{ paddingVertical: 16 }}>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <TextInput style={[styles.input, { backgroundColor: "#0b0b0b", color: theme.text }]} placeholder="Full name" placeholderTextColor={theme.muted} value={name} onChangeText={setName} />
            <TextInput style={[styles.input, { backgroundColor: "#0b0b0b", color: theme.text }]} placeholder="NCAT EMAIL" placeholderTextColor={theme.muted} value={email} onChangeText={setEmail} autoCapitalize="none" />
            <TextInput style={[styles.input, { backgroundColor: "#0b0b0b", color: theme.text }]} placeholder="Password" placeholderTextColor={theme.muted} secureTextEntry value={password} onChangeText={setPassword} />

            <PressableScale onPress={doSignup}>
              <View style={[styles.primaryBtn, { backgroundColor: theme.gold, marginTop: 10 }]}>
                <Text style={[styles.primaryBtnText, { color: "#071014" }]}>Create account</Text>
              </View>
            </PressableScale>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

/* ---------------- BUILDING ROLE ---------------- */
function BuildingRoleScreen({ navigation, theme }) {
  const fade = useFadeIn(420);
  const [building, setBuilding] = useState("");
  const [role, setRole] = useState("professor");

  useEffect(() => {
    (async () => {
      const uJson = await AsyncStorage.getItem("user");
      if (uJson) {
        const u = JSON.parse(uJson);
        if (u.building) setBuilding(u.building);
        if (u.role) setRole(u.role);
      }
    })();
  }, []);

  const saveProfile = async () => {
    if (!building) return Alert.alert("Enter building.");
    const uJson = await AsyncStorage.getItem("user");
    const u = uJson ? JSON.parse(uJson) : null;
    if (!u) return Alert.alert("Error", "No user found.");
    const updated = { ...u, building, role };
    await AsyncStorage.setItem("user", JSON.stringify(updated));
    const usersJson = await AsyncStorage.getItem("users");
    let users = usersJson ? JSON.parse(usersJson) : [];
    users = users.map((us) => (us.id === updated.id ? updated : us));
    await AsyncStorage.setItem("users", JSON.stringify(users));
    navigation.replace("Home");
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.bg }]}>
      <Animated.View style={[styles.container, { opacity: fade }]}>
        <AppHeader title="Profile & Access" subtitle="Set building and role" theme={theme} />
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <TextInput style={[styles.input, { backgroundColor: "#0b0b0b", color: theme.text }]} placeholder="Building (e.g., McNair Hall)" placeholderTextColor={theme.muted} value={building} onChangeText={setBuilding} />
          <Text style={[styles.label, { color: theme.muted }]}>Select role</Text>
          <View style={styles.roleRow}>
            {["professor", "researcher", "admin"].map((r) => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.roleBtn,
                  role === r ? { backgroundColor: theme.gold, borderColor: theme.gold } : { borderColor: theme.border, backgroundColor: theme.card },
                ]}
                onPress={() => setRole(r)}
              >
                <Text style={{ color: role === r ? "#071014" : theme.text, fontWeight: role === r ? "900" : "700" }}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <PressableScale onPress={saveProfile}>
            <View style={[styles.primaryBtn, { backgroundColor: theme.gold, marginTop: 12 }]}>
              <Text style={[styles.primaryBtnText, { color: "#071014" }]}>Save & Continue</Text>
            </View>
          </PressableScale>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

/* ---------------- REQUEST FORM (fixed examples chips) ---------------- */
function RequestFormScreen({ navigation, theme }) {
  const fade = useFadeIn(380);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // cleaned examples, no hyphens, longer chip width, wrapping support
  const examples = [
    { title: "Library After Hours Access", details: "Request extended library access during finals week (Dec 8–14)." },
    { title: "Reserve Quiet Study Room", details: "Reserve a quiet study room for 4 students each Friday evening." },
    { title: "Counseling Appointment Request", details: "Request counseling support for academic stress and time management." },
    { title: "Temporary Lab Access", details: "Request temporary lab access for research equipment calibration." },
    { title: "Event Space Reservation", details: "Reserve auditorium for guest lecture on campus innovation." },
  ];

  const applyExample = (ex) => {
    setTitle(ex.title);
    setDetails(ex.details);
  };

  const submit = async () => {
    if (!title.trim() || !details.trim()) return Alert.alert("Please complete title and details.");
    setSubmitting(true);
    try {
      const uJson = await AsyncStorage.getItem("user");
      const user = uJson ? JSON.parse(uJson) : { name: "Unknown", email: "unknown@ncat.edu" };
      const req = {
        id: Date.now().toString(),
        title: title.trim(),
        details: details.trim(),
        name: user.name,
        email: user.email,
        status: "Pending",
        timestamp: new Date().toISOString(),
        priority: "Normal",
      };
      const reqsJson = await AsyncStorage.getItem("requests");
      const reqs = reqsJson ? JSON.parse(reqsJson) : [];
      reqs.unshift(req);
      await AsyncStorage.setItem("requests", JSON.stringify(reqs));

      // simulate approval flow
      setTimeout(async () => {
        const r1 = (await AsyncStorage.getItem("requests")) || "[]";
        const arr1 = JSON.parse(r1);
        const updated1 = arr1.map((r) => (r.id === req.id ? { ...r, status: "Under review" } : r));
        await AsyncStorage.setItem("requests", JSON.stringify(updated1));

        setTimeout(async () => {
          const approve = Math.random() < 0.82; // slightly higher approval
          const final = approve ? "Approved" : "Rejected";
          const r2 = (await AsyncStorage.getItem("requests")) || "[]";
          const arr2 = JSON.parse(r2);
          const updated2 = arr2.map((r) => (r.id === req.id ? { ...r, status: final } : r));
          await AsyncStorage.setItem("requests", JSON.stringify(updated2));
          setSubmitting(false);
          navigation.replace("Requests");
        }, 2600);
      }, 1600);

      setTitle("");
      setDetails("");
    } catch (e) {
      console.log("submit error", e);
      Alert.alert("Error", "Could not submit request.");
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.bg }]}>
      <Animated.View style={[styles.container, { opacity: fade }]}>
        <AppHeader title="New Request" subtitle="Create a premium access request" theme={theme} />
        <ScrollView contentContainerStyle={{ paddingVertical: 14 }}>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Text style={[styles.label, { color: theme.muted }]}>Quick examples</Text>

            {/* examples row: flexible wrapping chips, larger minWidth so longer titles fit */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
              {examples.map((ex, i) => (
                <TouchableOpacity key={i} onPress={() => applyExample(ex)} activeOpacity={0.85}>
                  <View style={[styles.exampleChipPremium]}>
                    <Text numberOfLines={2} style={{ color: "#0b0b0b", fontWeight: "700", maxWidth: 220 }}>
                      {ex.title}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: theme.muted, marginTop: 12 }]}>Title</Text>
            <TextInput style={[styles.input, { minHeight: 44, backgroundColor: "#070708", color: theme.text }]} value={title} onChangeText={setTitle} placeholder="Short title" placeholderTextColor={theme.muted} />

            <Text style={[styles.label, { color: theme.muted }]}>Details</Text>
            <TextInput
              style={[styles.input, { minHeight: 120, textAlignVertical: "top", backgroundColor: "#070708", color: theme.text }]}
              value={details}
              onChangeText={setDetails}
              placeholder="Describe the request and justification"
              placeholderTextColor={theme.muted}
              multiline
            />

            <PressableScale onPress={submit} style={{ marginTop: 12 }}>
              <View style={[styles.primaryBtn, { backgroundColor: theme.gold }]}>
                <Text style={[styles.primaryBtnText, { color: "#071014" }]}>{submitting ? "Submitting..." : "Submit Request"}</Text>
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

  const load = async () => {
    const json = await AsyncStorage.getItem("requests");
    setReqs(json ? JSON.parse(json) : []);
  };

  useEffect(() => {
    const unsub = navigation.addListener("focus", load);
    load();
    return unsub;
  }, [navigation]);

  const renderItem = ({ item }) => (
    <View style={[styles.card, { marginBottom: 12, backgroundColor: theme.card }]}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ color: theme.text, fontWeight: "800" }}>{item.title}</Text>
        <Text style={{ color: theme.muted, fontSize: 12 }}>{new Date(item.timestamp).toLocaleString()}</Text>
      </View>
      <Text style={{ color: theme.muted, marginTop: 6 }}>{item.name} · {item.email}</Text>
      <Text style={{ color: theme.muted, marginTop: 8 }}>{item.details}</Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
        <View style={[styles.statusPill, { backgroundColor: item.status === "Approved" ? "#08243a" : item.status === "Rejected" ? "#2b0a0a" : "#1a1a1a", borderColor: item.status === "Approved" ? "#0a6fb9" : item.status === "Rejected" ? "#d14b4b" : "#333" }]}>
          <Text style={{ color: theme.goldMuted, fontWeight: "800" }}>{item.status}</Text>
        </View>
        <Text style={{ color: theme.muted }}>Priority: {item.priority || "Normal"}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.bg }]}>
      <Animated.View style={[styles.container, { opacity: useFadeIn(300) }]}>
        <AppHeader title="Requests History" subtitle="All submitted requests" theme={theme} />
        {reqs.length === 0 ? (
          <Text style={{ color: theme.muted, textAlign: "center", marginTop: 20 }}>No requests yet.</Text>
        ) : (
          <FlatList data={reqs} keyExtractor={(i) => i.id} renderItem={renderItem} contentContainerStyle={{ paddingBottom: 40 }} />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

/* ---------------- ADMIN DASHBOARD (Luxury KPIs) ---------------- */
function AdminPanel({ navigation, theme }) {
  const fade = useFadeIn(350);
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

    // mark related requests as Approved by Chair
    const reqsJson = await AsyncStorage.getItem("requests");
    let reqs = reqsJson ? JSON.parse(reqsJson) : [];
    reqs = reqs.map((r) => (r.email === userToApprove.email ? { ...r, status: "Approved by Chair" } : r));
    await AsyncStorage.setItem("requests", JSON.stringify(reqs));

    setBanner(`Approved ${userToApprove.name}`);
    setTimeout(() => setBanner(null), 2600);
    loadAll();
  };

  // KPI computations
  const totals = {
    totalRequests: requests.length,
    approved: requests.filter((r) => r.status === "Approved" || r.status === "Approved by Chair").length,
    rejected: requests.filter((r) => r.status === "Rejected").length,
    pending: requests.filter((r) => r.status === "Pending" || r.status === "Under review").length,
  };

  // estimate avg review time (simulated)
  const avgReviewMinutes = requests.length ? Math.round((requests.length * 20) / Math.max(1, totals.approved)) : 0; // fake metric
  const slaCompliance = totals.totalRequests ? Math.round(((totals.approved + 0.5 * totals.pending) / totals.totalRequests) * 100) : 0;
  const approvalRate = totals.totalRequests ? Math.round((totals.approved / totals.totalRequests) * 100) : 0;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.bg }]}>
      {banner && (
        <View style={{ backgroundColor: "#111212", padding: 10, alignItems: "center", borderBottomWidth: 1, borderColor: theme.border }}>
          <Text style={{ color: theme.goldMuted, fontWeight: "700" }}>{banner}</Text>
        </View>
      )}
      <Animated.View style={[styles.container, { opacity: fade }]}>
        <AppHeader title="Admin Console" subtitle="Executive overview • Premium" theme={theme} />
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
          {/* KPI Tiles */}
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.gold }]}>Executive KPIs</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
              <View style={styles.kpiTile}>
                <Text style={{ color: theme.muted, fontSize: 12 }}>Requests Today</Text>
                <Text style={{ color: theme.text, fontSize: 22, fontWeight: "900" }}>{totals.totalRequests}</Text>
              </View>
              <View style={styles.kpiTile}>
                <Text style={{ color: theme.muted, fontSize: 12 }}>Avg Review (min)</Text>
                <Text style={{ color: theme.text, fontSize: 22, fontWeight: "900" }}>{avgReviewMinutes}</Text>
              </View>
              <View style={styles.kpiTile}>
                <Text style={{ color: theme.muted, fontSize: 12 }}>SLA Compliance</Text>
                <Text style={{ color: theme.text, fontSize: 22, fontWeight: "900" }}>{slaCompliance}%</Text>
              </View>
            </View>

            {/* slim approval gauge (visual) */}
            <View style={{ marginTop: 14 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                <Text style={{ color: theme.muted }}>Approval Rate</Text>
                <Text style={{ color: theme.muted }}>{approvalRate}%</Text>
              </View>
              <View style={{ height: 12, backgroundColor: "#070708", borderRadius: 8, overflow: "hidden" }}>
                <View style={{ width: `${approvalRate}%`, height: 12, backgroundColor: "#00bcd4", borderRadius: 8 }} />
              </View>
            </View>
          </View>

          {/* pending approvals */}
          <View style={[styles.card, { marginTop: 12, backgroundColor: theme.card }]}>
            <Text style={[styles.cardTitle, { color: theme.gold }]}>Pending Approvals</Text>
            {pending.length === 0 ? (
              <Text style={{ color: theme.muted, marginTop: 8 }}>No pending users — all clear.</Text>
            ) : (
              pending.map((u) => (
                <View key={u.id} style={{ marginTop: 8 }}>
                  <Text style={{ fontWeight: "900", color: theme.text }}>{u.name}</Text>
                  <Text style={{ color: theme.muted }}>{u.email}</Text>
                  <PressableScale onPress={() => approve(u.id)} style={{ marginTop: 8 }}>
                    <View style={[styles.primaryBtn, { backgroundColor: theme.gold }]}>
                      <Text style={[styles.primaryBtnText, { color: "#071014" }]}>Approve</Text>
                    </View>
                  </PressableScale>
                </View>
              ))
            )}
          </View>

          <PressableScale onPress={() => navigation.navigate("Requests")} style={{ marginTop: 12 }}>
            <View style={[styles.ghostBtn, { alignItems: "center" }]}>
              <Text style={[styles.ghostBtnText, { color: theme.gold }]}>View full requests</Text>
            </View>
          </PressableScale>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

/* ---------------- HOME (parallax + premium OneCard) ---------------- */
function PremiumOneCard({ user, theme }) {
  const glow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
        Animated.timing(glow, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const glowInterp = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255,215,0,0.06)", "rgba(0,255,213,0.08)"],
  });

  return (
    <Animated.View style={[styles.onecardPremium, { backgroundColor: "#050505", shadowColor: theme.gold, borderColor: "#131313", borderWidth: 1, boxShadow: 'none' }]}>
      <Animated.View style={{ position: "absolute", top: -12, left: -20, right: -20, height: 44, backgroundColor: glowInterp, borderRadius: 200, opacity: 0.5 }} pointerEvents="none" />
      <Text style={{ color: theme.gold, fontSize: 20, fontWeight: "900" }}>AGGIE ELITE</Text>
      <Text style={{ color: theme.text, marginTop: 10, fontWeight: "800", fontSize: 16 }}>{user?.name || "Student Name"}</Text>
      <Text style={{ color: theme.muted, marginTop: 4 }}>{user?.email || "example@ncat.edu"}</Text>

      <View style={{ marginTop: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <Text style={{ color: theme.muted, fontSize: 10 }}>Card ID</Text>
          <Text style={{ color: theme.text, fontWeight: "900" }}>{user?.id?.slice(-6) || "000000"}</Text>
        </View>

        <View style={{ alignItems: "center" }}>
          <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: "#071014" }}>
            <Text style={{ color: theme.gold, fontWeight: "900" }}>ONECARD</Text>
          </View>
          <View style={{ marginTop: 8 }}>
            <Text style={{ color: theme.muted, fontSize: 10 }}>Access</Text>
            <Text style={{ color: theme.text, fontWeight: "800" }}>Active</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

function HomeScreen({ navigation, theme }) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const fade = useFadeIn(420);
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const uJson = await AsyncStorage.getItem("user");
      if (uJson) setUser(JSON.parse(uJson));
    })();
  }, []);

  const logout = async () => {
    await AsyncStorage.removeItem("user");
    navigation.replace("Login");
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.bg }]}>
      <Animated.View style={[styles.container, { opacity: fade }]}>
        <AppHeader title="Aggie Elite Access" subtitle={`Welcome${user ? `, ${user.name.split(" ")[0]}` : ""}`} theme={theme} scrollY={scrollY} right={
          <TouchableOpacity onPress={() => navigation.navigate("Requests")}>
            <Text style={{ color: theme.gold, fontWeight: "900" }}>Requests</Text>
          </TouchableOpacity>
        } />

        <Animated.ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          scrollEventThrottle={16}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        >
          <View style={{ marginTop: 8, paddingHorizontal: 4 }}>
            <PremiumOneCard user={user} theme={theme} />

            <View style={{ marginTop: 14 }}>
              <PressableScale onPress={() => navigation.navigate("RequestForm")}>
                <View style={[styles.primaryBtn, { backgroundColor: theme.gold }]}>
                  <Text style={[styles.primaryBtnText, { color: "#071014" }]}>New Premium Request</Text>
                </View>
              </PressableScale>
            </View>

            <View style={{ marginTop: 12 }}>
              <PressableScale onPress={() => navigation.navigate("BuildingRole")}>
                <View style={[styles.ghostBtn, { borderColor: theme.border }]}>
                  <Text style={[styles.ghostBtnText, { color: theme.gold }]}>Edit Profile</Text>
                </View>
              </PressableScale>
            </View>

            <View style={{ marginTop: 12 }}>
              <PressableScale onPress={logout}>
                <View style={[styles.primaryBtn, { backgroundColor: "#0a0d10" }]}>
                  <Text style={[styles.primaryBtnText, { color: theme.gold }]}>Sign out</Text>
                </View>
              </PressableScale>
            </View>
          </View>
        </Animated.ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

/* ---------------- APP ROOT ---------------- */
export default function App() {
  const deviceScheme = useColorScheme();
  const [scheme, setScheme] = useState(deviceScheme || "dark");
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

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) =>
      setScheme(colorScheme || "dark")
    );
    return () => sub.remove();
  }, []);

  const theme = buildTheme(scheme);

  if (loading) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: theme.bg }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.gold} />
          <Text style={{ marginTop: 10, color: theme.muted }}>
            Starting premium app…
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
        {/* Auth screens (NOT inside drawer) */}
        <Stack.Screen name="Login">
          {(props) => <LoginScreen {...props} theme={theme} />}
        </Stack.Screen>

        <Stack.Screen name="Signup">
          {(props) => <SignupScreen {...props} theme={theme} />}
        </Stack.Screen>

        <Stack.Screen name="BuildingRole">
          {(props) => <BuildingRoleScreen {...props} theme={theme} />}
        </Stack.Screen>

        {/* Drawer App (post-login) */}
        <Stack.Screen name="MainApp">
          {() => (
            <Drawer.Navigator
              initialRouteName="Home"
              screenOptions={{
                headerShown: false,
                drawerStyle: {
                  backgroundColor: theme.panel,
                  width: 240,
                },
                drawerActiveTintColor: theme.gold,
                drawerInactiveTintColor: theme.muted,
              }}
            >
              <Drawer.Screen name="Home">
                {(props) => <HomeScreen {...props} theme={theme} />}
              </Drawer.Screen>

              <Drawer.Screen name="RequestForm" options={{ title: "New Request" }}>
                {(props) => <RequestFormScreen {...props} theme={theme} />}
              </Drawer.Screen>

              <Drawer.Screen name="Requests" options={{ title: "Requests History" }}>
                {(props) => <RequestsScreen {...props} theme={theme} />}
              </Drawer.Screen>

              <Drawer.Screen name="AdminPanel" options={{ title: "Admin Panel" }}>
                {(props) => <AdminPanel {...props} theme={theme} />}
              </Drawer.Screen>

              <Drawer.Screen name="Profile" options={{ title: "Profile / Building & Role" }}>
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
  container: { padding: 18, paddingTop: 18, flex: 1 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 12,
  },
  logoText: { fontWeight: "900", fontSize: 24 },
  headerTitle: { fontSize: 18, fontWeight: "900" },
  headerSubtitle: { fontSize: 12, marginTop: 2 },
  card: {
    borderRadius: 14,
    padding: 16,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
  },
  cardTitle: { fontSize: 16, fontWeight: "900", marginBottom: 6 },
  hint: { fontSize: 12, marginBottom: 10 },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderColor: "#1b1b1b",
  },
  primaryBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 6,
  },
  primaryBtnText: { fontWeight: "900" },
  ghostBtn: { borderWidth: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  ghostBtnText: { fontWeight: "800" },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 12, alignItems: "center" },
  link: { fontWeight: "900", marginLeft: 8 },
  label: { marginTop: 8, marginBottom: 6 },
  roleRow: { flexDirection: "row", justifyContent: "space-between" },
  roleBtn: { flex: 1, marginHorizontal: 4, padding: 10, borderRadius: 8, borderWidth: 1, alignItems: "center" },
  roleBtnTextSelected: { color: "#fff", fontWeight: "700" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  fieldLabel: { fontSize: 12, marginTop: 10 },
  fieldValue: { fontSize: 15, fontWeight: "700" },

  exampleChipPremium: {
    backgroundColor: "#F7E9BF", // light gold paper for high contrast text
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    marginRight: 10,
    marginTop: 8,
    minWidth: 140,
    maxWidth: 240,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },

  onecardPremium: {
    borderRadius: 14,
    padding: 18,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 22,
    elevation: 12,
  },

  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },

  kpiTile: {
    flex: 1,
    marginRight: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#070708",
    alignItems: "flex-start",
  },
});
