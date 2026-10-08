ALTER TABLE "approvals" ADD COLUMN "key" text;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "key" text;--> statement-breakpoint
CREATE INDEX "approvals_key_idx" ON "approvals" USING btree ("key");--> statement-breakpoint
CREATE INDEX "tasks_key_idx" ON "tasks" USING btree ("key");