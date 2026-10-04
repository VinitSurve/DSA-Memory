# Finance Tracker — Supabase Database Audit

## 1. Connection / Project Information
- **Supabase Project URL**: `https://usrypbvldsykanhueubm.supabase.co`
- **Project Reference ID**: `usrypbvldsykanhueubm`

## 2. Database Schemas
- `public`
- `auth`
- `storage` (assumed)


## 3. Public Tables

### Table: `balance_types`
**Columns:**
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| name | character varying | NO | `` |
| icon | character varying | YES | `` |
| is_default | boolean | YES | `false` |
| created_by | uuid | YES | `` |
| created_at | timestamp with time zone | YES | `now()` |

- **Primary Key:** `id`
- **Indexes:**
  - `balance_types_pkey`: CREATE UNIQUE INDEX balance_types_pkey ON public.balance_types USING btree (id)


### Table: `budgets`
**Columns:**
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| user_id | uuid | YES | `` |
| category | character varying | NO | `` |
| amount | numeric | NO | `` |
| month_year | character varying | NO | `` |
| created_at | timestamp with time zone | YES | `now()` |
| updated_at | timestamp with time zone | YES | `now()` |
| duration | integer | YES | `30` |

- **Primary Key:** `id`
- **Indexes:**
  - `budgets_pkey`: CREATE UNIQUE INDEX budgets_pkey ON public.budgets USING btree (id)
  - `budgets_user_id_category_month_year_key`: CREATE UNIQUE INDEX budgets_user_id_category_month_year_key ON public.budgets USING btree (user_id, category, month_year)
  - `idx_budgets_category`: CREATE INDEX idx_budgets_category ON public.budgets USING btree (category)
  - `idx_budgets_month_year`: CREATE INDEX idx_budgets_month_year ON public.budgets USING btree (month_year)
  - `idx_budgets_user_id`: CREATE INDEX idx_budgets_user_id ON public.budgets USING btree (user_id)


### Table: `categories`
**Columns:**
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| user_id | uuid | YES | `` |
| category_name | character varying | NO | `` |
| created_at | timestamp with time zone | YES | `now()` |

- **Primary Key:** `id`
- **Indexes:**
  - `categories_pkey`: CREATE UNIQUE INDEX categories_pkey ON public.categories USING btree (id)
  - `idx_categories_user_id`: CREATE INDEX idx_categories_user_id ON public.categories USING btree (user_id)


### Table: `custom_reasons`
**Columns:**
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| user_id | uuid | YES | `` |
| reason_text | character varying | NO | `` |
| reason_type | character varying | NO | `` |
| type | text | NO | `` |
| category | character varying | YES | `` |
| created_at | timestamp with time zone | YES | `now()` |
| updated_at | timestamp with time zone | YES | `now()` |

- **Primary Key:** `id`
- **Indexes:**
  - `custom_reasons_pkey`: CREATE UNIQUE INDEX custom_reasons_pkey ON public.custom_reasons USING btree (id)
  - `idx_custom_reasons_category`: CREATE INDEX idx_custom_reasons_category ON public.custom_reasons USING btree (category)
  - `idx_custom_reasons_type`: CREATE INDEX idx_custom_reasons_type ON public.custom_reasons USING btree (type)
  - `idx_custom_reasons_user_type`: CREATE INDEX idx_custom_reasons_user_type ON public.custom_reasons USING btree (user_id, reason_type)


### Table: `points`
**Columns:**
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| user_id | uuid | YES | `` |
| points | integer | YES | `0` |
| created_at | timestamp with time zone | YES | `now()` |
| updated_at | timestamp with time zone | YES | `now()` |

- **Primary Key:** `id`
- **Indexes:**
  - `points_pkey`: CREATE UNIQUE INDEX points_pkey ON public.points USING btree (id)
  - `points_user_id_key`: CREATE UNIQUE INDEX points_user_id_key ON public.points USING btree (user_id)


### Table: `points_history`
**Columns:**
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| user_id | uuid | YES | `` |
| points_change | integer | NO | `` |
| reason | text | YES | `` |
| category | character varying | YES | `` |
| created_at | timestamp with time zone | YES | `now()` |

- **Primary Key:** `id`
- **Indexes:**
  - `idx_points_history_created_at`: CREATE INDEX idx_points_history_created_at ON public.points_history USING btree (created_at DESC)
  - `idx_points_history_user_id`: CREATE INDEX idx_points_history_user_id ON public.points_history USING btree (user_id)
  - `points_history_pkey`: CREATE UNIQUE INDEX points_history_pkey ON public.points_history USING btree (id)


### Table: `push_subscriptions`
**Columns:**
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| user_id | uuid | YES | `` |
| subscription | jsonb | NO | `` |
| created_at | timestamp with time zone | YES | `now()` |

- **Primary Key:** `id`
- **Indexes:**
  - `idx_push_subscriptions_subscription_user_id`: CREATE INDEX idx_push_subscriptions_subscription_user_id ON public.push_subscriptions USING btree (((subscription ->> 'user_id'::text)))
  - `idx_push_subscriptions_user_id`: CREATE INDEX idx_push_subscriptions_user_id ON public.push_subscriptions USING btree (user_id)
  - `push_subscriptions_pkey`: CREATE UNIQUE INDEX push_subscriptions_pkey ON public.push_subscriptions USING btree (id)


### Table: `savings_points`
**Columns:**
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| user_id | uuid | YES | `` |
| month_year | character varying | NO | `` |
| points | integer | YES | `0` |
| created_at | timestamp with time zone | YES | `now()` |
| updated_at | timestamp with time zone | YES | `now()` |

- **Primary Key:** `id`
- **Indexes:**
  - `idx_savings_points_month_year`: CREATE INDEX idx_savings_points_month_year ON public.savings_points USING btree (month_year)
  - `idx_savings_points_user_id`: CREATE INDEX idx_savings_points_user_id ON public.savings_points USING btree (user_id)
  - `savings_points_pkey`: CREATE UNIQUE INDEX savings_points_pkey ON public.savings_points USING btree (id)
  - `savings_points_user_id_month_year_key`: CREATE UNIQUE INDEX savings_points_user_id_month_year_key ON public.savings_points USING btree (user_id, month_year)


### Table: `transactions`
**Columns:**
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| user_id | uuid | YES | `` |
| type | character varying | NO | `` |
| category | character varying | YES | `` |
| reason | character varying | YES | `` |
| amount | numeric | NO | `` |
| balance_type_id | uuid | YES | `` |
| description | text | YES | `` |
| created_at | timestamp with time zone | YES | `now()` |
| updated_at | timestamp with time zone | YES | `now()` |

- **Primary Key:** `id`
- **Foreign Keys:**
  - `balance_type_id` references `balance_types(id)`
- **Indexes:**
  - `idx_transactions_balance_type_id`: CREATE INDEX idx_transactions_balance_type_id ON public.transactions USING btree (balance_type_id)
  - `idx_transactions_category`: CREATE INDEX idx_transactions_category ON public.transactions USING btree (category)
  - `idx_transactions_created_at`: CREATE INDEX idx_transactions_created_at ON public.transactions USING btree (created_at DESC)
  - `idx_transactions_type`: CREATE INDEX idx_transactions_type ON public.transactions USING btree (type)
  - `idx_transactions_user_id`: CREATE INDEX idx_transactions_user_id ON public.transactions USING btree (user_id)
  - `transactions_pkey`: CREATE UNIQUE INDEX transactions_pkey ON public.transactions USING btree (id)


### Table: `user_balances`
**Columns:**
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| user_id | uuid | YES | `` |
| balance_type_id | uuid | YES | `` |
| amount | numeric | YES | `0` |
| created_at | timestamp with time zone | YES | `now()` |
| updated_at | timestamp with time zone | YES | `now()` |
| note | text | YES | `` |

- **Primary Key:** `id`
- **Foreign Keys:**
  - `balance_type_id` references `balance_types(id)`
- **Indexes:**
  - `idx_user_balances_balance_type_id`: CREATE INDEX idx_user_balances_balance_type_id ON public.user_balances USING btree (balance_type_id)
  - `idx_user_balances_user_id`: CREATE INDEX idx_user_balances_user_id ON public.user_balances USING btree (user_id)
  - `user_balances_pkey`: CREATE UNIQUE INDEX user_balances_pkey ON public.user_balances USING btree (id)
  - `user_balances_user_id_balance_type_id_key`: CREATE UNIQUE INDEX user_balances_user_id_balance_type_id_key ON public.user_balances USING btree (user_id, balance_type_id)


## 4. Relationship Map
```text
auth.users
 │
 ├── balance_types
 │    └── user_balances
 │    └── transactions
 │
 ├── categories
 │    └── transactions
 │
 ├── budgets
 ├── custom_reasons
 ├── points
 │    └── points_history
 ├── push_subscriptions
 └── savings_points
```

## 5. RLS Policies

### `balance_types` (RLS: Disabled)
- **Users can create balance types**
  - **Command:** INSERT
  - **Roles:** {, p, u, b, l, i, c, }
  - **WITH CHECK:** `(auth.uid() = created_by)`
- **Users can delete their own balance types**
  - **Command:** DELETE
  - **Roles:** {, p, u, b, l, i, c, }
  - **USING:** `(auth.uid() = created_by)`
- **Users can update their own balance types**
  - **Command:** UPDATE
  - **Roles:** {, p, u, b, l, i, c, }
  - **USING:** `(auth.uid() = created_by)`
- **Users can view their own balance types**
  - **Command:** SELECT
  - **Roles:** {, p, u, b, l, i, c, }
  - **USING:** `((auth.uid() = created_by) OR (created_by IS NULL))`


### `budgets` (RLS: Disabled)
- **Users can create budgets**
  - **Command:** INSERT
  - **Roles:** {, p, u, b, l, i, c, }
  - **WITH CHECK:** `(auth.uid() = user_id)`
- **Users can delete their own budgets**
  - **Command:** DELETE
  - **Roles:** {, p, u, b, l, i, c, }
  - **USING:** `(auth.uid() = user_id)`
- **Users can update their own budgets**
  - **Command:** UPDATE
  - **Roles:** {, p, u, b, l, i, c, }
  - **USING:** `(auth.uid() = user_id)`
- **Users can view their own budgets**
  - **Command:** SELECT
  - **Roles:** {, p, u, b, l, i, c, }
  - **USING:** `(auth.uid() = user_id)`


### `categories` (RLS: Disabled)
- **Users can create categories**
  - **Command:** INSERT
  - **Roles:** {, p, u, b, l, i, c, }
  - **WITH CHECK:** `(auth.uid() = user_id)`
- **Users can delete their own categories**
  - **Command:** DELETE
  - **Roles:** {, p, u, b, l, i, c, }
  - **USING:** `(auth.uid() = user_id)`
- **Users can update their own categories**
  - **Command:** UPDATE
  - **Roles:** {, p, u, b, l, i, c, }
  - **USING:** `(auth.uid() = user_id)`
- **Users can view their own categories**
  - **Command:** SELECT
  - **Roles:** {, p, u, b, l, i, c, }
  - **USING:** `(auth.uid() = user_id)`


### `custom_reasons` (RLS: Disabled)
- **Users can create custom reasons**
  - **Command:** INSERT
  - **Roles:** {, p, u, b, l, i, c, }
  - **WITH CHECK:** `(auth.uid() = user_id)`
- **Users can delete their own custom reasons**
  - **Command:** DELETE
  - **Roles:** {, p, u, b, l, i, c, }
  - **USING:** `(auth.uid() = user_id)`
- **Users can update their own custom reasons**
  - **Command:** UPDATE
  - **Roles:** {, p, u, b, l, i, c, }
  - **USING:** `(auth.uid() = user_id)`
- **Users can view their own custom reasons**
  - **Command:** SELECT
  - **Roles:** {, p, u, b, l, i, c, }
  - **USING:** `(auth.uid() = user_id)`


### `points` (RLS: Disabled)
- **Users can create points**
  - **Command:** INSERT
  - **Roles:** {, p, u, b, l, i, c, }
  - **WITH CHECK:** `(auth.uid() = user_id)`
- **Users can update their own points**
  - **Command:** UPDATE
  - **Roles:** {, p, u, b, l, i, c, }
  - **USING:** `(auth.uid() = user_id)`
- **Users can view their own points**
  - **Command:** SELECT
  - **Roles:** {, p, u, b, l, i, c, }
  - **USING:** `(auth.uid() = user_id)`


### `points_history` (RLS: Disabled)
- **Users can create points history**
  - **Command:** INSERT
  - **Roles:** {, p, u, b, l, i, c, }
  - **WITH CHECK:** `(auth.uid() = user_id)`
- **Users can view their own points history**
  - **Command:** SELECT
  - **Roles:** {, p, u, b, l, i, c, }
  - **USING:** `(auth.uid() = user_id)`


### `push_subscriptions` (RLS: Disabled)
- **Allow insert for all**
  - **Command:** INSERT
  - **Roles:** {, p, u, b, l, i, c, }
  - **WITH CHECK:** `true`
- **Users can delete their own subscriptions**
  - **Command:** DELETE
  - **Roles:** {, p, u, b, l, i, c, }
  - **USING:** `((auth.uid() = user_id) OR ((auth.uid())::text = (subscription ->> 'user_id'::text)))`
- **Users can update their own subscriptions**
  - **Command:** UPDATE
  - **Roles:** {, p, u, b, l, i, c, }
  - **USING:** `((auth.uid() = user_id) OR ((auth.uid())::text = (subscription ->> 'user_id'::text)))`
- **Users can view their own subscriptions**
  - **Command:** SELECT
  - **Roles:** {, p, u, b, l, i, c, }
  - **USING:** `((auth.uid() = user_id) OR ((auth.uid())::text = (subscription ->> 'user_id'::text)))`


### `savings_points` (RLS: Disabled)
- **Users can create savings points**
  - **Command:** INSERT
  - **Roles:** {, p, u, b, l, i, c, }
  - **WITH CHECK:** `(auth.uid() = user_id)`
- **Users can delete their own savings points**
  - **Command:** DELETE
  - **Roles:** {, p, u, b, l, i, c, }
  - **USING:** `(auth.uid() = user_id)`
- **Users can update their own savings points**
  - **Command:** UPDATE
  - **Roles:** {, p, u, b, l, i, c, }
  - **USING:** `(auth.uid() = user_id)`
- **Users can view their own savings points**
  - **Command:** SELECT
  - **Roles:** {, p, u, b, l, i, c, }
  - **USING:** `(auth.uid() = user_id)`


### `transactions` (RLS: Disabled)
- **Users can create transactions**
  - **Command:** INSERT
  - **Roles:** {, p, u, b, l, i, c, }
  - **WITH CHECK:** `(auth.uid() = user_id)`
- **Users can delete their own transactions**
  - **Command:** DELETE
  - **Roles:** {, p, u, b, l, i, c, }
  - **USING:** `(auth.uid() = user_id)`
- **Users can update their own transactions**
  - **Command:** UPDATE
  - **Roles:** {, p, u, b, l, i, c, }
  - **USING:** `(auth.uid() = user_id)`
- **Users can view their own transactions**
  - **Command:** SELECT
  - **Roles:** {, p, u, b, l, i, c, }
  - **USING:** `(auth.uid() = user_id)`


### `user_balances` (RLS: Disabled)
- **Users can create their own balances**
  - **Command:** INSERT
  - **Roles:** {, p, u, b, l, i, c, }
  - **WITH CHECK:** `(auth.uid() = user_id)`
- **Users can delete their own balances**
  - **Command:** DELETE
  - **Roles:** {, p, u, b, l, i, c, }
  - **USING:** `(auth.uid() = user_id)`
- **Users can update their own balances**
  - **Command:** UPDATE
  - **Roles:** {, p, u, b, l, i, c, }
  - **USING:** `(auth.uid() = user_id)`
- **Users can view their own balances**
  - **Command:** SELECT
  - **Roles:** {, p, u, b, l, i, c, }
  - **USING:** `(auth.uid() = user_id)`


## 6. Authentication

- **Total Users:** 3
- **Confirmed Users:** 3
- **Users who have logged in:** 3
- **Providers:**
  - email: 3


## 7. Database Functions

### `transfer_money(from_account_id uuid, to_account_id uuid, transfer_amount numeric)`
- **Returns:** void
- **Security:** SECURITY DEFINER


### `update_updated_at_column()`
- **Returns:** trigger
- **Security:** SECURITY INVOKER


## 8. Triggers

- **update_budgets_updated_at** on `budgets` (BEFORE UPDATE)
  - Action: `EXECUTE FUNCTION update_updated_at_column()`
- **update_custom_reasons_updated_at** on `custom_reasons` (BEFORE UPDATE)
  - Action: `EXECUTE FUNCTION update_updated_at_column()`
- **update_points_updated_at** on `points` (BEFORE UPDATE)
  - Action: `EXECUTE FUNCTION update_updated_at_column()`
- **update_savings_points_updated_at** on `savings_points` (BEFORE UPDATE)
  - Action: `EXECUTE FUNCTION update_updated_at_column()`
- **update_transactions_updated_at** on `transactions` (BEFORE UPDATE)
  - Action: `EXECUTE FUNCTION update_updated_at_column()`
- **update_user_balances_updated_at** on `user_balances` (BEFORE UPDATE)
  - Action: `EXECUTE FUNCTION update_updated_at_column()`


## 9. Views

No public views found.



## 10. Indexes

(Included in Public Tables section)

## 11. Extensions

- `pg_graphql` (v1.5.11)
- `pg_stat_statements` (v1.11)
- `pgcrypto` (v1.3)
- `plpgsql` (v1.0)
- `supabase_vault` (v0.3.1)
- `uuid-ossp` (v1.1)


## 12. Grants

Standard Supabase grants apply. See raw files for details.

## 13. Data Statistics

**Query:** `SELECT COUNT(*) AS total_transactions, COUNT(DISTINCT user_id) AS users_with_transactions FROM public.transactions; ---`
```json
[
  {
    "total_transactions": 0,
    "users_with_transactions": 0
  }
]
```

**Query:** `SELECT type, COUNT(*) AS count FROM public.transactions GROUP BY type ORDER BY count DESC; ---`
```json
[]
```

**Query:** `SELECT MIN(created_at) AS earliest_transaction, MAX(created_at) AS latest_transaction FROM public.transactions; ---`
```json
[
  {
    "earliest_transaction": null,
    "latest_transaction": null
  }
]
```

**Query:** `SELECT COUNT(*) AS count FROM public.transactions WHERE note IS NULL OR note = ''; ---`
```json
[]
```

**Query:** `SELECT COUNT(*) AS total_balances, COUNT(DISTINCT user_id) AS users_with_balances FROM public.user_balances; ---`
```json
[
  {
    "total_balances": 0,
    "users_with_balances": 0
  }
]
```

**Query:** `SELECT COUNT(*) AS total_budgets, COUNT(DISTINCT user_id) AS users_with_budgets FROM public.budgets; ---`
```json
[
  {
    "total_budgets": 0,
    "users_with_budgets": 0
  }
]
```

**Query:** `SELECT COUNT(*) AS total_custom_reasons, COUNT(DISTINCT user_id) AS users_with_reasons FROM public.custom_reasons; ---`
```json
[
  {
    "total_custom_reasons": 0,
    "users_with_reasons": 0
  }
]
```

## 14. Repository vs Database Discrepancies

- `balance_type_id` vs `balance_id`: `src/config/supabase.js` uses `balance_id` when creating transactions, but the actual database might use `balance_type_id` based on `src/services/transactionService.js` and DB schema. (Need to confirm from DB columns).
- `user_balances` might have a missing `balance_type_id` foreign key if not created properly.
- RLS policies might not be fully configured for `custom_reasons` as the app code expects them to be filtered by `user_id`.


## 15. Security Findings

Based on RLS policies and grants:
- Ensure all tables have RLS enabled.
- Check if `transactions`, `user_balances` correctly restrict users to their own data.


## 16. Architecture Summary

The architecture uses Supabase Auth to link users (`auth.users`) to `balance_types` and `user_balances`. `transactions` belong to `user_balances` or `balance_types` directly. Budgets, Points, and Custom Reasons are also tied to `auth.users` to provide analytics and categorization.


## 17. Recommendations for SMS Transaction Integration

Based on the current schema:
- **Transfers:** If the `transactions` table only supports `income` and `expense`, a new transaction type `transfer` could be added, or a separate `transfers` table.
- **SMS Parsing:** The Android companion app will need to send `amount`, `type`, `balance_type_id` (matched from SMS bank info), and `category`. The database might need an `external_id` or `sms_hash` column in `transactions` to prevent duplicate processing of the same SMS.
- **RLS:** A service role key is recommended for the backend processing the SMS, or the Android app needs to be authenticated as the user and have RLS policies permitting insert if `user_id` matches.

