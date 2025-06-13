import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { Alert, Platform } from "react-native";

const uploadMysqlBackup = async () => {
  try {
    const backupApiUrl = "http://192.168.100.8:3033/api/backup";  // apna backend URL daalo
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

    // File ko app directory mein copy karo with timestamp
    const pdfPath = `${FileSystem.documentDirectory}backup_${Date.now()}.pdf`;
    await FileSystem.copyAsync({ from: uri, to: pdfPath });

    Alert.alert("Backup Created", "PDF backup generated successfully!");

    // Share karna ho toh:
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
