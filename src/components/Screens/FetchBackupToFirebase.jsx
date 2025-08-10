import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { Alert, Platform } from "react-native";

const backupApiUrl = "http://192.168.100.8:3033/api/backup"; // your backend URL

// ✅ Generate PDF Backup
const uploadMysqlBackup = async () => {
  try {
    const response = await fetch(backupApiUrl);
    if (!response.ok) throw new Error("Failed to fetch backup data");

    const data = await response.json();
    if (data.error) {
      Alert.alert("Error", data.error);
      return;
    }

    const { transactions = [], budgets = [] } = data;

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial; padding: 20px; }
            h1 { color: #004a99; }
            h2 { margin-top: 30px; color: #007bff; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ccc; padding: 8px; font-size: 12px; text-align: left; }
            th { background-color: #f0f0f0; }
          </style>
        </head>
        <body>
          <h1>📊 Budget Breeze Backup</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>

          <h2>💸 Transactions</h2>
          <table>
            <tr>
              <th>#</th>
              <th>ID</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Date</th>
            </tr>
            ${transactions.map((t, i) =>
              `<tr>
                <td>${i + 1}</td>
                <td>${t.id}</td>
                <td>${t.type || '-'}</td>
                <td>${t.amount}</td>
                <td>${t.category}</td>
                <td>${new Date(t.date).toLocaleDateString()}</td>
              </tr>`
            ).join('')}
          </table>

          <h2>📅 Budgets</h2>
          <table>
            <tr>
              <th>ID</th>
              <th>Category</th>
              <th>Amount</th>
              <th>CreatedAt</th>
            </tr>
            ${budgets.map((b) =>
              `<tr>
                <td>${b.id}</td>
                <td>${b.category}</td>
                <td>${b.amount}</td>
                <td>${new Date(b.created_at).toLocaleDateString()}</td>
              </tr>`
            ).join('')}
          </table>
        </body>
      </html>
    `;

    // PDF create karo
    const { uri } = await Print.printToFileAsync({ html: htmlContent });

    const pdfPath = `${FileSystem.documentDirectory}backup_${Date.now()}.pdf`;
    await FileSystem.copyAsync({ from: uri, to: pdfPath });

    Alert.alert("Backup Created", "PDF backup generated successfully!");

    // Share if needed
    if (Platform.OS !== "web") {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(pdfPath);
      }
    }
  } catch (error) {
    console.error("Error generating backup PDF:", error);
    Alert.alert("Error", "Failed to generate PDF backup.");
  }
};

// ✅ Restore from backup API
const restoreMysqlBackup = async () => {
  try {
    const restoreApiUrl = "http://192.168.100.8:3033/api/backup/restore";
    // Ideally you would prepare restore data here.
    // For demo, fetching existing backup data and re-sending as restore

    const backupResponse = await fetch(backupApiUrl);
    const backupData = await backupResponse.json();

    const response = await fetch(restoreApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(backupData),
    });

    const result = await response.json();

    if (response.ok) {
      Alert.alert("Restore Success", result.message || "Data restored successfully.");
    } else {
      Alert.alert("Restore Failed", result.error || "Failed to restore data.");
    }
  } catch (error) {
    console.error("Restore error:", error);
    Alert.alert("Error", "Something went wrong while restoring the backup.");
  }
};

export { uploadMysqlBackup, restoreMysqlBackup };
