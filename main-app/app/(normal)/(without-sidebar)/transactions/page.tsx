import { notFound, redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { fetchCreditTransactions } from "@/actions/transactionActions";
import { checkAuthentication } from "@/actions/authActions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transactions - Manim AI",
  description: "View all your credit transactions and balance history",
};

export default async function TransactionsPage() {
  const session = await checkAuthentication();

  if (!session) {
    redirect("/login");
  }

  // Fetch all credit transactions for the user
  const transactions = await fetchCreditTransactions(session.id);
  if (!transactions) {
    notFound();
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">Completed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "purchase":
        return <Badge variant="default">Purchase</Badge>;
      case "video_generation":
        return <Badge variant="secondary">Video Generation</Badge>;
      case "refund":
        return <Badge variant="outline">Refund</Badge>;
      case "bonus":
        return <Badge variant="default">Bonus</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl pt-16">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-100 dark:to-neutral-400">
            Credit Transactions
          </h1>
          <p className="text-muted-foreground mt-2">
            View all your credit transactions and balance history
          </p>
        </div>

        <Card className="p-6">
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No transactions found. Start creating animations to see your
                transaction history!
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Balance After</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {formatDate(transaction.createdAt)}
                      </TableCell>
                      <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {transaction.description || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {transaction.amount > 0 ? (
                            <ArrowUpIcon className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowDownIcon className="h-4 w-4 text-red-500" />
                          )}
                          <span
                            className={
                              transaction.amount > 0
                                ? "text-green-600 dark:text-green-400 font-semibold"
                                : "text-red-600 dark:text-red-400 font-semibold"
                            }
                          >
                            {transaction.amount > 0 ? "+" : ""}
                            {transaction.amount}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {transaction.balanceAfter}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.transactionalStatus)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
