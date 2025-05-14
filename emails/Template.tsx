import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface EmailTemplateProps {
  userName: string;
  data: any;
  type: string;
}

export default function EmailTemplate({
  userName,
  data,
  type,
}: EmailTemplateProps) {
  if (type === "due-reminders") {
    return (
      <Html>
        <Head />
        <Preview>Upcoming Transactions Reminder</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Heading style={styles.title}>
              Upcoming Transactions Reminder
            </Heading>
            <Text style={styles.text}>Hello {userName},</Text>
            <Text style={styles.text}>
              You have the following transactions on due
            </Text>
            <Section style={styles.statsContainer}>
              {data.map((t: any, idx: number) => (
                <div style={styles.stat} key={idx}>
                  <Text style={styles.text}>
                    {t.categoryName} (${t.amount})
                  </Text>
                  <Text style={styles.heading}>{t.text}</Text>
                </div>
              ))}
              <Text style={styles.text}>
                Please review and mark them as completed if already paid.
              </Text>
            </Section>
            <Link href="http://localhost:3000/dashboard">[Open Dashboard]</Link>
          </Container>
        </Body>
      </Html>
    );
  }

  if (type === "budgets-alert") {
    return (
      <Html>
        <Head />
        <Preview>Monthly Budgets Alert</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Heading style={styles.title}>Monthly Budgets Alert</Heading>
            <Text style={styles.text}>Hello {userName},</Text>
            <Text style={styles.text}>
              You have used more than 90% of the following budgets
            </Text>
            <Section style={styles.statsContainer}>
              {data.map((b: any, idx: number) => (
                <div style={styles.stat} key={idx}>
                  <div style={styles.heading}>Budget Category:{b.category}</div>
                  <div style={styles.text}>Budget Amount:${b.amount}</div>
                  <div style={styles.text}>Spent so far:${b.totalSpent}</div>
                  <div style={styles.text}>
                    {b.remaining >= 0 ? "Remaining" : "Over Budget"}: $
                    {b.remaining >= 0 ? b.remaining : Math.abs(b.remaining)}
                  </div>
                  <div style={styles.text}>
                    Percentage Spent:{b.percentageSpent.toFixed(1)}%
                  </div>
                </div>
              ))}
            </Section>
            <Link href="http://localhost:3000/dashboard">[Open Dashboard]</Link>
          </Container>
        </Body>
      </Html>
    );
  }
}

const styles = {
  body: {
    backgroundColor: "#f6f9fc",
    fontFamily: "-apple-system, sans-serif",
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  title: {
    color: "#1f2937",
    fontSize: "32px",
    fontWeight: "bold",
    margin: "0 0 20px",
  },
  heading: {
    color: "#1f2937",
    fontSize: "20px",
    fontWeight: "600",
    margin: "0 0 16px",
  },
  text: {
    color: "#4b5563",
    fontSize: "16px",
    margin: "0 0 16px",
  },
  section: {
    marginTop: "32px",
    padding: "20px",
    backgroundColor: "#f9fafb",
    borderRadius: "5px",
    border: "1px solid #e5e7eb",
  },
  statsContainer: {
    margin: "32px 0",
    padding: "20px",
    backgroundColor: "#f9fafb",
    borderRadius: "5px",
  },
  stat: {
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "#fff",
    borderRadius: "4px",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #e5e7eb",
  },
  footer: {
    color: "#6b7280",
    fontSize: "14px",
    textAlign: "center",
    marginTop: "32px",
    paddingTop: "16px",
    borderTop: "1px solid #e5e7eb",
  },
};
