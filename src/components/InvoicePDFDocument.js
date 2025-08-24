// File: components/InvoicePDFDocument.js
"use client";

import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Using a standard font that supports bold weights reliably
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/helvetica/v11/TK3iWkU9c28-8oMA-BEI_A.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/helvetica/v11/TK3iWkU9c28-8oMA-BEI_A.ttf', fontWeight: 'bold' },
  ]
});

const styles = StyleSheet.create({
  page: { 
    fontFamily: 'Helvetica', 
    fontSize: 11, 
    paddingTop: 35, 
    paddingLeft: 40, 
    paddingRight: 40, 
    lineHeight: 1.5, 
    flexDirection: 'column' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', // Vertically aligns items in the header
    marginBottom: 25,
    borderBottomWidth: 2,
    borderBottomColor: '#16a34a',
    paddingBottom: 10,
  },
  headerText: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#16a34a' 
  },
  headerSubtext: {
    fontSize: 14,
    color: '#333333',
  },
  invoiceInfoContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 30 
  },
  billTo: { 
    marginTop: 15,
    paddingRight: 20 // Prevents long names from touching the other column
  },
  billToTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333333',
  },
  invoiceDetails: {
    textAlign: 'right' // Aligns the invoice ID, date, etc., to the right
  },
  detailItem: {
    marginBottom: 2,
  },
  table: { 
    width: "auto", 
    borderStyle: "solid", 
    borderColor: '#eaeaea', 
    borderWidth: 1, 
  },
  tableRow: { 
    flexDirection: "row",
    borderBottomColor: '#eaeaea',
    borderBottomWidth: 1,
  },
  tableColHeader: { 
    backgroundColor: '#f9f9f9',
    padding: 8,
    borderRightColor: '#eaeaea',
    borderRightWidth: 1,
  },
  tableCol: {
    padding: 8,
    borderRightColor: '#eaeaea',
    borderRightWidth: 1,
  },
  headerTextContent: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333333'
  },
  tableCell: { 
    fontSize: 10 
  },
  colDescription: { width: "55%" },
  colQty: { width: "15%" },
  colRate: { width: "15%" },
  colAmount: { width: "15%" },
  textRight: {
    textAlign: 'right'
  },
  totalSection: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    marginTop: 20 
  },
  totalContainer: {
    width: '45%',
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
    paddingTop: 10
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 11,
    color: '#555555'
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 'bold',
  }
});

export const InvoicePDFDocument = ({ invoiceData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      <View style={styles.header}>
        <Text style={styles.headerText}>ZAPVOICE</Text>
        <Text style={styles.headerSubtext}>Invoice</Text>
      </View>
      
      <View style={styles.invoiceInfoContainer}>
        <View style={styles.billTo}>
          <Text style={styles.billToTitle}>Bill To:</Text>
          <Text>{invoiceData.client_name}</Text>
          <Text>{invoiceData.client_email}</Text>
        </View>
        <View style={styles.invoiceDetails}>
          <Text style={styles.detailItem}>Invoice ID: {invoiceData.id || 'DRAFT'}</Text>
          <Text style={styles.detailItem}>Date: {new Date().toLocaleDateString()}</Text>
          <Text style={styles.detailItem}>Due Date: {new Date(invoiceData.due_date).toLocaleDateString()}</Text>
        </View>
      </View>

      {/* Table Header */}
      <View style={{...styles.tableRow, backgroundColor: '#f9f9f9'}}>
        <View style={{...styles.tableColHeader, ...styles.colDescription}}><Text style={styles.headerTextContent}>Description</Text></View>
        <View style={{...styles.tableColHeader, ...styles.colQty}}><Text style={{...styles.headerTextContent, ...styles.textRight}}>Quantity</Text></View>
        <View style={{...styles.tableColHeader, ...styles.colRate}}><Text style={{...styles.headerTextContent, ...styles.textRight}}>Rate</Text></View>
        <View style={{...styles.tableColHeader, ...styles.colAmount, borderRightWidth: 0}}><Text style={{...styles.headerTextContent, ...styles.textRight}}>Amount</Text></View>
      </View>

      {/* Table Body */}
      <View style={styles.table}>
        {invoiceData.items.map((item, index) => (
          <View style={styles.tableRow} key={index}>
            <View style={{...styles.tableCol, ...styles.colDescription}}><Text style={styles.tableCell}>{item.description}</Text></View>
            <View style={{...styles.tableCol, ...styles.colQty}}><Text style={{...styles.tableCell, ...styles.textRight}}>{item.quantity}</Text></View>
            <View style={{...styles.tableCol, ...styles.colRate}}><Text style={{...styles.tableCell, ...styles.textRight}}>${item.rate.toFixed(2)}</Text></View>
            <View style={{...styles.tableCol, ...styles.colAmount, borderRightWidth: 0}}><Text style={{...styles.tableCell, ...styles.textRight}}>${(item.quantity * item.rate).toFixed(2)}</Text></View>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totalSection}>
        <View style={styles.totalContainer}>
           <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>${invoiceData.total.toFixed(2)}</Text>
           </View>
           <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax (0%)</Text>
              <Text style={styles.totalValue}>$0.00</Text>
           </View>
           <View style={{...styles.totalRow, marginTop: 5}}>
              <Text style={{...styles.totalLabel, fontWeight: 'bold'}}>Total</Text>
              <Text style={{...styles.totalValue, color: '#16a34a'}}>${invoiceData.total.toFixed(2)}</Text>
           </View>
        </View>
      </View>

    </Page>
  </Document>
);