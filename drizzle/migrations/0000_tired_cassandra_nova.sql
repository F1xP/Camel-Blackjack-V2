CREATE TABLE IF NOT EXISTS "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"discord_id" varchar(255),
	"discord_username" varchar(255),
	"discord__email" varchar(255),
	"google_id" varchar(255),
	"google_username" varchar(255),
	"google_email" varchar(255),
	"github_id" varchar(255),
	"github_username" varchar(255),
	"x_id" varchar(255),
	"x_username" varchar(255),
	"dribbble_id" varchar(255),
	"dribbble_username" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "accounts_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "accounts_discord_id_unique" UNIQUE("discord_id"),
	CONSTRAINT "accounts_google_id_unique" UNIQUE("google_id"),
	CONSTRAINT "accounts_github_id_unique" UNIQUE("github_id"),
	CONSTRAINT "accounts_x_id_unique" UNIQUE("x_id"),
	CONSTRAINT "accounts_dribbble_id_unique" UNIQUE("dribbble_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"player_hands" jsonb NOT NULL,
	"dealer_hand" jsonb NOT NULL,
	"button_state" smallint DEFAULT 0 NOT NULL,
	"message" varchar(255),
	"deck" jsonb NOT NULL,
	"balance" numeric(10, 2) DEFAULT '1000' NOT NULL,
	"current_bet" numeric(10, 2) DEFAULT '10' NOT NULL,
	"current_hand_index" integer DEFAULT 0 NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" varchar(39) NOT NULL,
	"hashed_password" varchar(255) NOT NULL,
	"password_salt" varchar(255) NOT NULL,
	"bio" text,
	"role" text DEFAULT 'Default' NOT NULL,
	"balance" numeric(10, 2) DEFAULT '1000' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "games" ADD CONSTRAINT "games_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
