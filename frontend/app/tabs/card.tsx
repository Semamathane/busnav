import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput, ScrollView,
  ActivityIndicator, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import api from '../../services/api';
import { colors, spacing, radius, shadows, gradients } from '../../theme';
import { Snackbar } from 'react-native-paper';

const AMOUNTS = [50, 100, 200, 300, 500];
const METHODS = [
  { id: 'card', label: 'Debit/Credit Card', icon: 'card' as const },
  { id: 'snapscan', label: 'SnapScan / Instant EFT', icon: 'phone-portrait' as const },
  { id: 'voucher', label: 'Voucher Code', icon: 'ticket' as const },
];

interface WalletData {
  id: string;
  balance: number;
  cardNumber: string;
  cardholderName: string;
}

interface TxData {
  id: string;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export default function CardScreen() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<TxData[]>([]);
  const [amount, setAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [method, setMethod] = useState('card');
  const [voucher, setVoucher] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [wRes, tRes] = await Promise.all([
        api.get('/api/wallet'),
        api.get('/api/wallet/transactions?limit=5'),
      ]);
      setWallet(wRes?.data?.wallet ?? null);
      setTransactions(tRes?.data?.transactions ?? []);
    } catch { /* ignore */ } finally {
      setFetchLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const selectedAmount = isCustom ? (parseFloat(customAmount) || 0) : amount;
  const newBalance = (wallet?.balance ?? 0) + selectedAmount;

  const handlePay = async () => {
    if (selectedAmount < 10) {
      setSnackMsg('Minimum top-up is R10');
      setSnackVisible(true);
      return;
    }
    if (method === 'voucher' && !voucher?.trim()) {
      setSnackMsg('Please enter a voucher code');
      setSnackVisible(true);
      return;
    }
    setLoading(true);
    try {
      const body: any = { amount: selectedAmount, paymentMethod: method };
      if (method === 'voucher') body.voucherCode = voucher.trim();
      const res = await api.post('/api/wallet/topup', body);
      setWallet(res?.data?.wallet ?? wallet);
      const newTx = res?.data?.transaction;
      if (newTx) setTransactions((prev) => [newTx, ...(prev ?? [])].slice(0, 5));
      setSnackMsg(`Successfully topped up R${res?.data?.transaction?.amount ?? selectedAmount}`);
      setSnackVisible(true);
      setVoucher('');
    } catch (e: any) {
      setSnackMsg(e?.response?.data?.message ?? 'Payment failed');
      setSnackVisible(true);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.title}>Connector Card</Text>

        {/* Card */}
        <LinearGradient colors={gradients.card} style={styles.walletCard}>
          <Text style={styles.cardLabel}>A Re Yeng</Text>
          <Text style={styles.cardBalance}>R {(wallet?.balance ?? 0).toFixed(2)}</Text>
          <View style={styles.cardBottom}>
            <Text style={styles.cardNum}>{wallet?.cardNumber ?? '**** **** **** ****'}</Text>
            <Text style={styles.cardHolder}>{wallet?.cardholderName ?? ''}</Text>
          </View>
        </LinearGradient>

        {/* Amount grid */}
        <Text style={styles.sectionTitle}>Select Amount</Text>
        <View style={styles.amountGrid}>
          {AMOUNTS.map((a) => (
            <Pressable
              key={a}
              style={[styles.amountBtn, !isCustom && amount === a && styles.amountActive]}
              onPress={() => { setAmount(a); setIsCustom(false); }}
            >
              <Text style={[styles.amountText, !isCustom && amount === a && styles.amountActiveText]}>R{a}</Text>
            </Pressable>
          ))}
          <Pressable
            style={[styles.amountBtn, isCustom && styles.amountActive]}
            onPress={() => setIsCustom(true)}
          >
            <Text style={[styles.amountText, isCustom && styles.amountActiveText]}>Other</Text>
          </Pressable>
        </View>
        {isCustom && (
          <TextInput
            style={styles.customInput}
            value={customAmount}
            onChangeText={setCustomAmount}
            placeholder="Enter amount"
            keyboardType="numeric"
            placeholderTextColor={colors.textMuted}
          />
        )}

        {/* Payment methods */}
        <Text style={styles.sectionTitle}>Payment Method</Text>
        {METHODS.map((m) => (
          <Pressable key={m.id} style={styles.methodRow} onPress={() => setMethod(m.id)}>
            <Ionicons name={m.icon} size={22} color={method === m.id ? colors.primary : colors.textMuted} />
            <Text style={[styles.methodLabel, method === m.id && { color: colors.primary, fontWeight: '700' }]}>{m.label}</Text>
            <View style={[styles.radio, method === m.id && styles.radioActive]} />
          </Pressable>
        ))}
        {method === 'voucher' && (
          <TextInput
            style={styles.voucherInput}
            value={voucher}
            onChangeText={setVoucher}
            placeholder="Enter voucher code"
            autoCapitalize="characters"
            placeholderTextColor={colors.textMuted}
          />
        )}

        {/* Preview */}
        <View style={styles.preview}>
          <Text style={styles.previewText}>New balance after top-up — <Text style={{ fontWeight: '700' }}>R {newBalance.toFixed(2)}</Text></Text>
        </View>

        {/* Pay button */}
        <Pressable onPress={handlePay} disabled={loading} style={{ marginHorizontal: spacing.md }}>
          <LinearGradient colors={gradients.primary} style={styles.payBtn}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.payBtnText}>Pay R{selectedAmount} Securely</Text>}
          </LinearGradient>
        </Pressable>

        {/* Transactions */}
        <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Recent Transactions</Text>
        {(transactions?.length ?? 0) === 0 ? (
          <Text style={styles.emptyTx}>No transactions yet</Text>
        ) : (
          (transactions ?? []).map((tx) => (
            <View key={tx?.id} style={[styles.txRow, shadows.card]}>
              <View style={styles.txLeft}>
                <Text style={styles.txMethod}>{(tx?.paymentMethod ?? '').toUpperCase()}</Text>
                <Text style={styles.txDate}>{tx?.createdAt ? new Date(tx.createdAt).toLocaleDateString() : ''}</Text>
              </View>
              <Text style={[styles.txAmount, { color: (tx?.status ?? '') === 'success' ? colors.onTimeGreen : colors.error }]}>+R{(tx?.amount ?? 0).toFixed(2)}</Text>
            </View>
          ))
        )}
      </ScrollView>
      <Snackbar visible={snackVisible} onDismiss={() => setSnackVisible(false)} duration={3000}>{snackMsg}</Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, paddingHorizontal: spacing.md, paddingTop: spacing.md },
  walletCard: {
    marginHorizontal: spacing.md, marginTop: spacing.md, borderRadius: 20, padding: spacing.lg,
    height: 190, justifyContent: 'space-between',
  },
  cardLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  cardBalance: { fontSize: 32, fontWeight: '700', color: '#fff' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  cardNum: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  cardHolder: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, paddingHorizontal: spacing.md, marginTop: spacing.lg, marginBottom: spacing.sm },
  amountGrid: {
    flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.md, gap: spacing.sm,
  },
  amountBtn: {
    width: '30%', paddingVertical: 14, borderRadius: radius.md,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.border, alignItems: 'center',
  },
  amountActive: { borderColor: colors.primary, backgroundColor: '#EBF5FB' },
  amountText: { fontSize: 16, fontWeight: '600', color: colors.text },
  amountActiveText: { color: colors.primary },
  customInput: {
    marginHorizontal: spacing.md, marginTop: spacing.sm, backgroundColor: '#fff',
    borderRadius: radius.md, padding: 14, fontSize: 16, borderWidth: 1, borderColor: colors.border,
    color: colors.text,
  },
  methodRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    marginHorizontal: spacing.md, marginBottom: spacing.xs, padding: 14,
    borderRadius: radius.md, gap: 12,
  },
  methodLabel: { flex: 1, fontSize: 15, color: colors.text },
  radio: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.border,
  },
  radioActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  voucherInput: {
    marginHorizontal: spacing.md, marginTop: spacing.sm, backgroundColor: '#fff',
    borderRadius: radius.md, padding: 14, fontSize: 16, borderWidth: 1, borderColor: colors.border,
    color: colors.text,
  },
  preview: { marginHorizontal: spacing.md, marginTop: spacing.md, padding: 14, backgroundColor: '#EBF5FB', borderRadius: radius.md },
  previewText: { fontSize: 14, color: colors.primary, textAlign: 'center' },
  payBtn: { paddingVertical: 16, borderRadius: radius.xl, alignItems: 'center', marginTop: spacing.md },
  payBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  emptyTx: { textAlign: 'center', color: colors.textMuted, marginTop: 12, fontSize: 14, paddingHorizontal: spacing.md },
  txRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', marginHorizontal: spacing.md, marginBottom: spacing.xs,
    padding: 14, borderRadius: radius.md,
  },
  txLeft: {},
  txMethod: { fontSize: 13, fontWeight: '600', color: colors.text },
  txDate: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  txAmount: { fontSize: 16, fontWeight: '700' },
});
