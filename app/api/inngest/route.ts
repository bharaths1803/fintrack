import { serve } from "inngest/next";
import {
  generateBudgetAlerts,
  generateDueReminders,
  generateFinancialJokes,
  generateMonthlyReports,
  helloWorld,
  processRecurringTransactions,
  triggerRecurringTransactions,
} from "../../../lib/inngest/functions";
import { inngest } from "../../../lib/inngest/client";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    /* your functions will be passed here later! */
    helloWorld,
    processRecurringTransactions,
    triggerRecurringTransactions,
    generateDueReminders,
    generateBudgetAlerts,
    generateFinancialJokes,
    generateMonthlyReports,
  ],
});
