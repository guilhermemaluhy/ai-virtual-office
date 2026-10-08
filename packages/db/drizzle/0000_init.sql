CREATE TYPE "public"."agent_role" AS ENUM('diretor', 'estrategista', 'cadastro', 'ads', 'afiliados', 'campanhas', 'atendimento', 'comprador');--> statement-breakpoint
CREATE TYPE "public"."agent_state" AS ENUM('idle', 'working', 'meeting', 'awaiting_approval', 'alert', 'offline');--> statement-breakpoint
CREATE TYPE "public"."approval_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."listing_status" AS ENUM('active', 'paused', 'draft');--> statement-breakpoint
CREATE TYPE "public"."marketplace" AS ENUM('mercado_livre', 'shopee');--> statement-breakpoint
CREATE TYPE "public"."report_kind" AS ENUM('marketplace_daily', 'ceo_summary');--> statement-breakpoint
CREATE TYPE "public"."risk_level" AS ENUM('read', 'low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('todo', 'in_progress', 'done');--> statement-breakpoint
CREATE TABLE "agents" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"title" text NOT NULL,
	"role" "agent_role" NOT NULL,
	"marketplace" "marketplace",
	"reports_to" text,
	"state" "agent_state" DEFAULT 'idle' NOT NULL,
	"autonomy" "risk_level" DEFAULT 'read' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requested_by" text NOT NULL,
	"action" text NOT NULL,
	"summary" text NOT NULL,
	"risk" "risk_level" NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" "approval_status" DEFAULT 'pending' NOT NULL,
	"decided_by" text,
	"decision_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"decided_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor" text NOT NULL,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text NOT NULL,
	"before" jsonb,
	"after" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"marketplace" "marketplace" NOT NULL,
	"external_id" text NOT NULL,
	"title" text NOT NULL,
	"price_cents" integer NOT NULL,
	"status" "listing_status" NOT NULL,
	"quality_score" integer NOT NULL,
	"visits_30d" integer DEFAULT 0 NOT NULL,
	"sales_30d" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"marketplace" "marketplace" NOT NULL,
	"external_id" text NOT NULL,
	"quantity" integer NOT NULL,
	"total_cents" integer NOT NULL,
	"ordered_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sku" text NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"cost_cents" integer NOT NULL,
	"stock" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "report_kind" NOT NULL,
	"marketplace" "marketplace",
	"author_id" text,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" text NOT NULL,
	"title" text NOT NULL,
	"details" text,
	"status" "task_status" DEFAULT 'todo' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_reports_to_agents_id_fk" FOREIGN KEY ("reports_to") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_requested_by_agents_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_author_id_agents_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "approvals_status_idx" ON "approvals" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "listings_marketplace_external_id_idx" ON "listings" USING btree ("marketplace","external_id");--> statement-breakpoint
CREATE INDEX "listings_product_id_idx" ON "listings" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_marketplace_external_id_idx" ON "orders" USING btree ("marketplace","external_id");--> statement-breakpoint
CREATE INDEX "orders_listing_id_idx" ON "orders" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "tasks_agent_id_idx" ON "tasks" USING btree ("agent_id");