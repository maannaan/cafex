--
-- PostgreSQL database dump
--

\restrict qkp9iopM1Fptd3NN0HsGnUWRDJY5EjrVM5g4GU7sdUa9mRcRJaLwzBnHG5nRSOH

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: FulfilmentType; Type: TYPE; Schema: public; Owner: cafex_user
--

CREATE TYPE public."FulfilmentType" AS ENUM (
    'PICKUP',
    'DINE_IN',
    'DELIVERY'
);


ALTER TYPE public."FulfilmentType" OWNER TO cafex_user;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: cafex_user
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING_PAYMENT',
    'PLACED',
    'ACCEPTED',
    'PREPARING',
    'READY',
    'COMPLETED',
    'CANCELLED',
    'PAYMENT_FAILED'
);


ALTER TYPE public."OrderStatus" OWNER TO cafex_user;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: cafex_user
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'AUTHORIZED',
    'CAPTURED',
    'FAILED',
    'REFUNDED'
);


ALTER TYPE public."PaymentStatus" OWNER TO cafex_user;

--
-- Name: ReservationStatus; Type: TYPE; Schema: public; Owner: cafex_user
--

CREATE TYPE public."ReservationStatus" AS ENUM (
    'PENDING_APPROVAL',
    'CONFIRMED',
    'SEATED',
    'COMPLETED',
    'CANCELLED',
    'REJECTED',
    'NO_SHOW'
);


ALTER TYPE public."ReservationStatus" OWNER TO cafex_user;

--
-- Name: RoleType; Type: TYPE; Schema: public; Owner: cafex_user
--

CREATE TYPE public."RoleType" AS ENUM (
    'ADMIN',
    'MANAGER',
    'STAFF',
    'CUSTOMER'
);


ALTER TYPE public."RoleType" OWNER TO cafex_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: cafex_user
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "userId" text,
    action text NOT NULL,
    entity text NOT NULL,
    "entityId" text NOT NULL,
    metadata jsonb,
    "ipAddress" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AuditLog" OWNER TO cafex_user;

--
-- Name: BusinessSettings; Type: TABLE; Schema: public; Owner: cafex_user
--

CREATE TABLE public."BusinessSettings" (
    id text DEFAULT 'singleton'::text NOT NULL,
    "cafeName" text DEFAULT 'Cafex Roastery'::text NOT NULL,
    tagline text DEFAULT 'Artisan Coffee & Warm Gatherings'::text NOT NULL,
    address text DEFAULT '100 Artisan Way, Downtown Cultural District'::text NOT NULL,
    phone text DEFAULT '+91 98765 43210'::text NOT NULL,
    email text DEFAULT 'hello@cafexroastery.com'::text NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    "currencySymbol" text DEFAULT '₹'::text NOT NULL,
    timezone text DEFAULT 'Asia/Kolkata'::text NOT NULL,
    "openingHoursJson" jsonb NOT NULL,
    "taxPercentage" numeric(65,30) DEFAULT 5.0 NOT NULL,
    "deliveryEnabled" boolean DEFAULT false NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BusinessSettings" OWNER TO cafex_user;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: cafex_user
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Category" OWNER TO cafex_user;

--
-- Name: Coupon; Type: TABLE; Schema: public; Owner: cafex_user
--

CREATE TABLE public."Coupon" (
    id text NOT NULL,
    code text NOT NULL,
    "discountType" text NOT NULL,
    "discountValue" integer NOT NULL,
    "minSpendMinor" integer DEFAULT 0 NOT NULL,
    "maxDiscountMinor" integer,
    "usageLimit" integer,
    "usageCount" integer DEFAULT 0 NOT NULL,
    "expiresAt" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."Coupon" OWNER TO cafex_user;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: cafex_user
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "orderNumber" text NOT NULL,
    "userId" text,
    "customerName" text NOT NULL,
    "customerEmail" text NOT NULL,
    "customerPhone" text NOT NULL,
    "fulfilmentType" public."FulfilmentType" DEFAULT 'PICKUP'::public."FulfilmentType" NOT NULL,
    status public."OrderStatus" DEFAULT 'PENDING_PAYMENT'::public."OrderStatus" NOT NULL,
    "subtotalMinor" integer NOT NULL,
    "taxMinor" integer DEFAULT 0 NOT NULL,
    "discountMinor" integer DEFAULT 0 NOT NULL,
    "deliveryFeeMinor" integer DEFAULT 0 NOT NULL,
    "totalMinor" integer NOT NULL,
    notes text,
    "cancellationReason" text,
    "idempotencyKey" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Order" OWNER TO cafex_user;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: cafex_user
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text NOT NULL,
    "productName" text NOT NULL,
    quantity integer NOT NULL,
    "unitPriceMinor" integer NOT NULL,
    "lineTotalMinor" integer NOT NULL
);


ALTER TABLE public."OrderItem" OWNER TO cafex_user;

--
-- Name: OrderItemOptionSnapshot; Type: TABLE; Schema: public; Owner: cafex_user
--

CREATE TABLE public."OrderItemOptionSnapshot" (
    id text NOT NULL,
    "orderItemId" text NOT NULL,
    "groupName" text NOT NULL,
    "optionName" text NOT NULL,
    "priceDeltaMinor" integer NOT NULL
);


ALTER TABLE public."OrderItemOptionSnapshot" OWNER TO cafex_user;

--
-- Name: Payment; Type: TABLE; Schema: public; Owner: cafex_user
--

CREATE TABLE public."Payment" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    provider text DEFAULT 'RAZORPAY'::text NOT NULL,
    "providerPaymentId" text,
    "providerOrderId" text,
    "amountMinor" integer NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "rawWebhookPayload" jsonb,
    "verifiedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Payment" OWNER TO cafex_user;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: cafex_user
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    "categoryId" text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text NOT NULL,
    "basePriceMinor" integer NOT NULL,
    "imageUrl" text NOT NULL,
    "modelUrl" text,
    "isAvailable" boolean DEFAULT true NOT NULL,
    "dietaryNotes" text[],
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Product" OWNER TO cafex_user;

--
-- Name: ProductOption; Type: TABLE; Schema: public; Owner: cafex_user
--

CREATE TABLE public."ProductOption" (
    id text NOT NULL,
    "groupId" text NOT NULL,
    name text NOT NULL,
    "priceDeltaMinor" integer DEFAULT 0 NOT NULL,
    "isAvailable" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."ProductOption" OWNER TO cafex_user;

--
-- Name: ProductOptionGroup; Type: TABLE; Schema: public; Owner: cafex_user
--

CREATE TABLE public."ProductOptionGroup" (
    id text NOT NULL,
    "productId" text NOT NULL,
    name text NOT NULL,
    "minSelect" integer DEFAULT 0 NOT NULL,
    "maxSelect" integer DEFAULT 1 NOT NULL
);


ALTER TABLE public."ProductOptionGroup" OWNER TO cafex_user;

--
-- Name: Reservation; Type: TABLE; Schema: public; Owner: cafex_user
--

CREATE TABLE public."Reservation" (
    id text NOT NULL,
    "userId" text,
    "customerName" text NOT NULL,
    "customerEmail" text NOT NULL,
    "customerPhone" text NOT NULL,
    date date NOT NULL,
    "timeSlot" text NOT NULL,
    "partySize" integer NOT NULL,
    "tableNumber" text,
    "specialNotes" text,
    status public."ReservationStatus" DEFAULT 'PENDING_APPROVAL'::public."ReservationStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Reservation" OWNER TO cafex_user;

--
-- Name: ReservationCapacity; Type: TABLE; Schema: public; Owner: cafex_user
--

CREATE TABLE public."ReservationCapacity" (
    id text NOT NULL,
    "dayOfWeek" integer NOT NULL,
    "timeSlot" text NOT NULL,
    "maxCovers" integer DEFAULT 24 NOT NULL,
    "maxParties" integer DEFAULT 8 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."ReservationCapacity" OWNER TO cafex_user;

--
-- Name: User; Type: TABLE; Schema: public; Owner: cafex_user
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    "passwordHash" text,
    name text NOT NULL,
    phone text,
    role public."RoleType" DEFAULT 'CUSTOMER'::public."RoleType" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO cafex_user;

--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: cafex_user
--

COPY public."AuditLog" (id, "userId", action, entity, "entityId", metadata, "ipAddress", "createdAt") FROM stdin;
466d77ba-257d-48d2-aa88-772d02925e03	\N	WEBHOOK_PAYMENT_CAPTURED	Payment	81026c6c-5934-4f99-8c1b-732d66a4f4b7	{"providerOrderId": "order_sandbox_CFX-20261122-5091", "providerPaymentId": "pay_valid_1795359375638"}	\N	2026-11-22 14:56:15.65
096ec40d-fceb-4950-8546-aa49b9516393	\N	ORDER_STATUS_CHANGED	Order	e641aefd-0292-48aa-acf5-dee9528928c7	{"to": "PREPARING", "from": "PLACED"}	\N	2026-11-22 14:56:15.929
\.


--
-- Data for Name: BusinessSettings; Type: TABLE DATA; Schema: public; Owner: cafex_user
--

COPY public."BusinessSettings" (id, "cafeName", tagline, address, phone, email, currency, "currencySymbol", timezone, "openingHoursJson", "taxPercentage", "deliveryEnabled", "updatedAt") FROM stdin;
singleton	Cafex Artisan Roastery	Single-Origin Coffee, Slow Pour & Handcrafted Pastries	42 Roaster Walk, Arts District, New Delhi, India 110001	+91 98101 23456	roastery@cafexartisan.com	INR	₹	Asia/Kolkata	{"friday": "07:30 - 22:00", "monday": "07:30 - 20:30", "sunday": "08:00 - 21:00", "tuesday": "07:30 - 20:30", "saturday": "08:00 - 22:00", "thursday": "07:30 - 20:30", "wednesday": "07:30 - 20:30"}	5.000000000000000000000000000000	t	2026-11-22 14:45:39.912
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: cafex_user
--

COPY public."Category" (id, name, slug, description, "sortOrder", "isActive", "createdAt", "updatedAt") FROM stdin;
5f5f8948-68fc-4e4f-a112-07fed1bd8ab9	Signature Drinks	signature-drinks	Exclusive house creations combining estate roasts with botanical infusions	1	t	2026-11-22 14:45:40.248	2026-11-22 14:45:40.248
a7fcfc91-5879-47bc-9b96-184885c13551	Espresso & Classics	espresso-classics	Dialed-in double shots, velvety microfoam and time-tested Italian profiles	2	t	2026-11-22 14:45:40.266	2026-11-22 14:45:40.266
8defab25-1cd6-48e9-be1b-4bcf96782f56	Manual Brews	manual-brews	Single-origin varietals prepared via V60, Chemex, and Aeropress	3	t	2026-11-22 14:45:40.28	2026-11-22 14:45:40.28
8d2ef3d5-cee0-4d0f-806f-1b012941a9d6	Cold & Nitro	cold-brews	18-hour cold steeped extractions and pressurized nitro pours	4	t	2026-11-22 14:45:40.29	2026-11-22 14:45:40.29
6c3d918a-5e0f-45ed-a6cb-d74fdd179755	Artisan Bakery	artisan-bakery	Laminated French viennoiserie and sourdough bakes made fresh every dawn	5	t	2026-11-22 14:45:40.303	2026-11-22 14:45:40.303
\.


--
-- Data for Name: Coupon; Type: TABLE DATA; Schema: public; Owner: cafex_user
--

COPY public."Coupon" (id, code, "discountType", "discountValue", "minSpendMinor", "maxDiscountMinor", "usageLimit", "usageCount", "expiresAt", "isActive") FROM stdin;
5a74c2da-ae96-4b6e-a7ea-c4b1337e73af	ROAST50	FIXED	5000	30000	\N	\N	0	\N	t
7784cc9c-b723-41aa-b250-40e035050971	WELCOME10	PERCENTAGE	10	20000	10000	500	1	\N	t
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: cafex_user
--

COPY public."Order" (id, "orderNumber", "userId", "customerName", "customerEmail", "customerPhone", "fulfilmentType", status, "subtotalMinor", "taxMinor", "discountMinor", "deliveryFeeMinor", "totalMinor", notes, "cancellationReason", "idempotencyKey", "createdAt", "updatedAt") FROM stdin;
e641aefd-0292-48aa-acf5-dee9528928c7	CFX-20261122-5091	\N	Aarav Mehta	aarav@example.com	+91 98200 12345	PICKUP	PREPARING	32000	1440	3200	0	30240	\N	\N	idemp_1795359375559_test	2026-11-22 14:56:15.595	2026-11-22 14:56:15.916
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: cafex_user
--

COPY public."OrderItem" (id, "orderId", "productId", "productName", quantity, "unitPriceMinor", "lineTotalMinor") FROM stdin;
7fa68021-5812-46cf-bb5b-80e0566af736	e641aefd-0292-48aa-acf5-dee9528928c7	0a32891b-182d-4ccd-a81e-dd3c505af1e1	Artisan Amber Latte	1	32000	32000
\.


--
-- Data for Name: OrderItemOptionSnapshot; Type: TABLE DATA; Schema: public; Owner: cafex_user
--

COPY public."OrderItemOptionSnapshot" (id, "orderItemId", "groupName", "optionName", "priceDeltaMinor") FROM stdin;
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: cafex_user
--

COPY public."Payment" (id, "orderId", provider, "providerPaymentId", "providerOrderId", "amountMinor", currency, status, "rawWebhookPayload", "verifiedAt", "createdAt", "updatedAt") FROM stdin;
81026c6c-5934-4f99-8c1b-732d66a4f4b7	e641aefd-0292-48aa-acf5-dee9528928c7	RAZORPAY	pay_valid_1795359375638	order_sandbox_CFX-20261122-5091	30240	INR	CAPTURED	{"event": "payment.captured", "order_id": "order_sandbox_CFX-20261122-5091", "payment_id": "pay_valid_1795359375638"}	2026-11-22 14:56:15.647	2026-11-22 14:56:15.595	2026-11-22 14:56:15.65
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: cafex_user
--

COPY public."Product" (id, "categoryId", name, slug, description, "basePriceMinor", "imageUrl", "modelUrl", "isAvailable", "dietaryNotes", "sortOrder", "createdAt", "updatedAt") FROM stdin;
0a32891b-182d-4ccd-a81e-dd3c505af1e1	5f5f8948-68fc-4e4f-a112-07fed1bd8ab9	Artisan Amber Latte	artisan-amber-latte	Double shot of Ethiopian Yirgacheffe, steamed oat milk, infused with raw cardamom honey and Madagascar vanilla bean.	32000	https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80	/models/hero/coffee-cup.glb	t	{Vegetarian,"Cardamom Honey"}	1	2026-11-22 14:45:40.323	2026-11-22 14:45:40.323
4024afc6-0c1b-4467-bc45-8dbe57583613	5f5f8948-68fc-4e4f-a112-07fed1bd8ab9	Smoked Sea Salt Cortado	smoked-sea-salt-cortado	1:1 ratio of intense ristretto and silky textured milk topped with Maldon smoked sea salt flake.	26000	https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80	\N	t	{Vegetarian}	2	2026-11-22 14:45:40.356	2026-11-22 14:45:40.356
32c422d1-172a-4861-b1e2-15408cff7c11	a7fcfc91-5879-47bc-9b96-184885c13551	Classic Velvet Flat White	classic-velvet-flat-white	Precision extracted double ristretto coated in glossy, micro-textured whole milk.	24000	https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=800&q=80	\N	t	{Classic}	3	2026-11-22 14:45:40.376	2026-11-22 14:45:40.376
95edef90-35f1-40d9-80ce-0f19ab972f87	8defab25-1cd6-48e9-be1b-4bcf96782f56	Single-Origin Chemex V60	single-origin-chemex-v60	Light roast washed Geisha with bright notes of jasmine, peach nectar, and bergamot.	34000	https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80	\N	t	{Vegan,Single-Origin,Filter}	4	2026-11-22 14:45:40.398	2026-11-22 14:45:40.398
e7d1c064-a098-4c03-bb90-7fc847db45af	8d2ef3d5-cee0-4d0f-806f-1b012941a9d6	Nitro Cascade Cold Brew	nitro-cascade-cold-brew	Slow-steeped for 20 hours and infused with nitrogen for a Guinness-like silky head with dark chocolate notes.	28000	https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80	\N	t	{Vegan,"Low Acidity"}	5	2026-11-22 14:45:40.415	2026-11-22 14:45:40.415
8bc2d4b3-bce3-4b3e-819d-19c087043519	6c3d918a-5e0f-45ed-a6cb-d74fdd179755	Golden Butter French Croissant	golden-butter-french-croissant	Layered with pure French Isigny butter, baked to a honeycomb interior with shatteringly crisp flakiness.	19000	https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80	\N	t	{Vegetarian,"Fresh Daily"}	6	2026-11-22 14:45:40.431	2026-11-22 14:45:40.431
\.


--
-- Data for Name: ProductOption; Type: TABLE DATA; Schema: public; Owner: cafex_user
--

COPY public."ProductOption" (id, "groupId", name, "priceDeltaMinor", "isAvailable") FROM stdin;
5be5d2c7-ff88-4cc4-a8e4-ea2a567ef1a7	39df5c94-b509-42df-bd98-9f790bcceca1	Oat Milk (Barista Edition)	0	t
311378e8-3832-47ba-a3c2-8be798e0dea3	39df5c94-b509-42df-bd98-9f790bcceca1	Whole Dairy Milk	0	t
8611329c-2e11-4512-bce4-bf912a5798c2	39df5c94-b509-42df-bd98-9f790bcceca1	Almond Milk	4000	t
fce41159-10c3-4acc-9728-dd66e438b491	f8e7f3d4-6e75-4564-8bdd-6deaf7e1915f	Extra Double Shot	6000	t
3a66040d-9c08-4347-9f5f-10e13050c303	e6390799-55d5-4c21-b759-f571c6169938	Whole Milk	0	t
b6bc918d-b61e-4464-8ca8-81d5ed3ea5ae	e6390799-55d5-4c21-b759-f571c6169938	Oat Milk	3000	t
47dcc486-8735-462c-bcd4-fe8b3b288406	65d3d125-000c-4b58-920a-1444d0c3030f	Standard Whole Milk	0	t
80328a68-ddf2-4de3-bda1-d87f1de6a74c	65d3d125-000c-4b58-920a-1444d0c3030f	Oat Milk	4000	t
a838c4b8-cad9-4b89-8093-5d0f1428ff6c	65d3d125-000c-4b58-920a-1444d0c3030f	Almond Milk	4000	t
722a728a-0916-4e04-9e25-a2b66a3b9c50	d16fdb72-b055-4d88-85eb-4572c1114750	Hot (65°C Barista Standard)	0	t
1fb1decd-e618-4e27-88c7-68de9fa5155a	d16fdb72-b055-4d88-85eb-4572c1114750	Extra Hot (72°C)	0	t
ae0d951e-1eef-4313-909c-474a17e78006	2b908c81-277f-472a-8864-6af738e62445	Hario V60 (Crisp & Clean)	0	t
ce61da9b-3080-4ce2-b659-269bd798d474	2b908c81-277f-472a-8864-6af738e62445	Chemex (Full Clarity)	2000	t
eea98490-695f-4875-87ae-a7163aa818ac	2b908c81-277f-472a-8864-6af738e62445	Aeropress (Rich Body)	0	t
ce99aba1-e829-45bd-8c1b-0ca781a9c35f	910a6024-216e-408d-86d3-984dd4e007e4	Unsweetened Black	0	t
00f3fb62-51d4-4a00-bdef-420d8f3e83dd	910a6024-216e-408d-86d3-984dd4e007e4	Light Demerara Syrup	2000	t
f19d0590-9611-426d-a885-8c090f84d868	0e7a5c32-d7ce-408f-bbd6-938b16c910a7	Warmed Oven Crisp	0	t
842c1e81-d5b8-47f3-822b-0c0f7a3fb3cc	0e7a5c32-d7ce-408f-bbd6-938b16c910a7	Room Temperature	0	t
\.


--
-- Data for Name: ProductOptionGroup; Type: TABLE DATA; Schema: public; Owner: cafex_user
--

COPY public."ProductOptionGroup" (id, "productId", name, "minSelect", "maxSelect") FROM stdin;
39df5c94-b509-42df-bd98-9f790bcceca1	0a32891b-182d-4ccd-a81e-dd3c505af1e1	Milk Choice	1	1
f8e7f3d4-6e75-4564-8bdd-6deaf7e1915f	0a32891b-182d-4ccd-a81e-dd3c505af1e1	Espresso Boost	0	1
e6390799-55d5-4c21-b759-f571c6169938	4024afc6-0c1b-4467-bc45-8dbe57583613	Milk Choice	1	1
65d3d125-000c-4b58-920a-1444d0c3030f	32c422d1-172a-4861-b1e2-15408cff7c11	Milk Choice	1	1
d16fdb72-b055-4d88-85eb-4572c1114750	32c422d1-172a-4861-b1e2-15408cff7c11	Temperature	1	1
2b908c81-277f-472a-8864-6af738e62445	95edef90-35f1-40d9-80ce-0f19ab972f87	Brew Method	1	1
910a6024-216e-408d-86d3-984dd4e007e4	e7d1c064-a098-4c03-bb90-7fc847db45af	Sweetness	1	1
0e7a5c32-d7ce-408f-bbd6-938b16c910a7	8bc2d4b3-bce3-4b3e-819d-19c087043519	Serving Style	1	1
\.


--
-- Data for Name: Reservation; Type: TABLE DATA; Schema: public; Owner: cafex_user
--

COPY public."Reservation" (id, "userId", "customerName", "customerEmail", "customerPhone", date, "timeSlot", "partySize", "tableNumber", "specialNotes", status, "createdAt", "updatedAt") FROM stdin;
977e99fc-ac89-4922-8e0a-6a9218e7db6b	\N	Samira Rao	samira@example.com	+91 98111 22233	2026-11-25	10:00	4	\N	\N	CONFIRMED	2026-11-22 14:56:15.961	2026-11-22 14:56:15.961
\.


--
-- Data for Name: ReservationCapacity; Type: TABLE DATA; Schema: public; Owner: cafex_user
--

COPY public."ReservationCapacity" (id, "dayOfWeek", "timeSlot", "maxCovers", "maxParties", "isActive") FROM stdin;
28980312-3672-4b05-9c87-74f40ada115b	0	08:30	24	8	t
0880e20c-f376-4fa2-a928-2fb4c11ae7ef	0	10:00	24	8	t
07e2eae9-4d41-4fd2-aa2c-1d44645ba799	0	11:30	24	8	t
b110203e-b6c4-4eb1-b92f-56edd22839aa	0	13:00	24	8	t
888a6834-c393-478d-94d3-a0b7ad83ecb0	0	14:30	24	8	t
2d30fe04-999d-48e3-9152-c177beb9bb96	0	16:00	24	8	t
da85bea4-e289-496f-ac46-2d1295859e60	0	17:30	24	8	t
727cc053-4f85-4129-a9dd-0f38c4245cf5	0	19:00	24	8	t
40ec7f95-482d-48df-ac36-74783e41a40d	0	20:30	24	8	t
1b320ef5-c249-4714-a388-61517ec01668	1	08:30	24	8	t
bd9318de-ed1d-4f53-87e0-4b7de948892a	1	10:00	24	8	t
9b5f1df0-715e-40b6-8b88-fc5551dc7587	1	11:30	24	8	t
44131299-2f53-4428-87e4-d7708b73416c	1	13:00	24	8	t
a51ffa6e-d293-41f5-aea8-3a1f5aaf47a7	1	14:30	24	8	t
5ff2afdd-2db6-4fc7-bfd5-a0f53a78e1c7	1	16:00	24	8	t
7fb60ae2-32e6-4c31-a814-7decca8c60db	1	17:30	24	8	t
1ffe7897-41c1-4ba1-b802-89ed32598a74	1	19:00	24	8	t
e9a17bef-faa0-4f82-b899-d8a2769e4e6d	1	20:30	24	8	t
527a5509-e416-4c53-a596-403773dcb15d	2	08:30	24	8	t
21c64967-c010-4e11-b20e-50a75139322d	2	10:00	24	8	t
2d2bcd6b-e98f-4c54-a25f-f7aefe9a6c33	2	11:30	24	8	t
40e499a6-2900-4284-a980-ba683103f76f	2	13:00	24	8	t
c9e7280e-4904-464b-9ec8-0685e3b6d16b	2	14:30	24	8	t
9f1c3c36-2168-41e6-96d0-99db82cd32b2	2	16:00	24	8	t
c73b6748-fc47-4ea6-8994-d672775d42c5	2	17:30	24	8	t
ee6e22ae-5510-4633-913a-13a012d3d52c	2	19:00	24	8	t
aa95b3c1-a095-419e-bb7e-debb9c925876	2	20:30	24	8	t
37edfbc0-ffd4-4acb-a0cf-f2e320c662f4	3	08:30	24	8	t
72649e24-6f77-42d3-a29d-68a46c771609	3	10:00	24	8	t
76a9341f-1a8d-42a7-8ca6-ddb833778d03	3	11:30	24	8	t
feee5bbd-5a7c-4a99-8baa-95dcbe13f16f	3	13:00	24	8	t
97703d09-6c61-47af-9693-7393e895a3d3	3	14:30	24	8	t
dacd4bf4-0d2f-4cf8-b621-b5177cdcc6ce	3	16:00	24	8	t
16ebd300-c7b8-4e34-87a5-0709bd8ee7a4	3	17:30	24	8	t
1e4c494c-ceb7-4ec5-8ee0-f584c584d015	3	19:00	24	8	t
7f53c092-86d4-4c55-8504-9f27127a1336	3	20:30	24	8	t
b5ac836c-b472-457c-9b72-2d436a8f9875	4	08:30	24	8	t
30059e04-47f8-4979-84e0-4b56dc0d8793	4	10:00	24	8	t
a06645e7-c0d7-4d69-97a1-bd6677e78296	4	11:30	24	8	t
1377dda5-8019-4a1a-8483-362097cd7d36	4	13:00	24	8	t
3db877bb-c7f9-4004-936d-677625550114	4	14:30	24	8	t
06cc9ef5-d2ad-4649-8411-591c1a02b3ea	4	16:00	24	8	t
f6ac5435-d1eb-4d37-9c8c-9cd79bfb8b28	4	17:30	24	8	t
a1e9851e-5596-4836-abdd-07493173c313	4	19:00	24	8	t
ca616974-12c8-4698-a05a-4f182686f20a	4	20:30	24	8	t
ada29b6d-1ff7-4243-b985-3762cf8f229a	5	08:30	24	8	t
8b268cc0-65ea-4ed7-aeb5-678db9c0acfc	5	10:00	24	8	t
cfed8e69-cb07-417d-97da-254884225434	5	11:30	24	8	t
a8c69a15-9ca4-4fb1-ad4b-1996d2e07acd	5	13:00	24	8	t
f55f3ebe-dde8-42fc-9dac-8b60e54d9dba	5	14:30	24	8	t
ddd7e18d-945f-425d-a258-fb02a9fab0df	5	16:00	24	8	t
6efcc0d1-489f-40d8-b8b7-26a2cbc137a4	5	17:30	24	8	t
c3dd163b-afc0-4d95-8382-c9de194fc6f7	5	19:00	24	8	t
6d43cf7b-2030-455b-a48c-48c18d90b661	5	20:30	24	8	t
808555aa-b205-4ba8-b44e-199631d6534a	6	08:30	24	8	t
1d82c30e-0d5b-443f-9fd1-6461c2ea3625	6	10:00	24	8	t
e96b4ffe-cbd7-4d88-b5df-90e950a5929c	6	11:30	24	8	t
37bc3db0-3b37-4af5-b743-8828974c8481	6	13:00	24	8	t
727a241a-1d24-46f3-8b04-3668222a5cfe	6	14:30	24	8	t
a16bfdb3-bdcc-4b45-89eb-5f7ae7030d79	6	16:00	24	8	t
de9d5c67-99e9-4cc6-8eca-d560b8ee745d	6	17:30	24	8	t
44e5102b-5f2d-4e80-82ea-112860baf09a	6	19:00	24	8	t
7e6bc0e1-b3f8-4aaf-b19a-403b9bf43a2e	6	20:30	24	8	t
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: cafex_user
--

COPY public."User" (id, email, "passwordHash", name, phone, role, "createdAt", "updatedAt") FROM stdin;
e2f92f1a-6339-4c3d-b492-f2c4c0ef57f0	admin@cafexartisan.com	$2a$10$jpM3zOPyIBWYGRabUuBpx.sJTXNoxtillo3eszEPC0.Ir5kMHlW1C	Elena Vance (Owner)	+91 98101 23456	ADMIN	2026-11-22 14:45:40.226	2026-11-22 14:45:40.226
bd1089a6-8b44-44eb-ad5e-9ca77d034b98	barista@cafexartisan.com	$2a$10$KbTMOzKD5o5874RmrgSdMu.YTtHwBce3tzqmh2Q7cJlLv.vNA3NRi	Devin K (Head Barista)	+91 98101 23457	STAFF	2026-11-22 14:45:40.24	2026-11-22 14:45:40.24
\.


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: cafex_user
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: BusinessSettings BusinessSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: cafex_user
--

ALTER TABLE ONLY public."BusinessSettings"
    ADD CONSTRAINT "BusinessSettings_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: cafex_user
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: Coupon Coupon_pkey; Type: CONSTRAINT; Schema: public; Owner: cafex_user
--

ALTER TABLE ONLY public."Coupon"
    ADD CONSTRAINT "Coupon_pkey" PRIMARY KEY (id);


--
-- Name: OrderItemOptionSnapshot OrderItemOptionSnapshot_pkey; Type: CONSTRAINT; Schema: public; Owner: cafex_user
--

ALTER TABLE ONLY public."OrderItemOptionSnapshot"
    ADD CONSTRAINT "OrderItemOptionSnapshot_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: cafex_user
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: cafex_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: cafex_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: ProductOptionGroup ProductOptionGroup_pkey; Type: CONSTRAINT; Schema: public; Owner: cafex_user
--

ALTER TABLE ONLY public."ProductOptionGroup"
    ADD CONSTRAINT "ProductOptionGroup_pkey" PRIMARY KEY (id);


--
-- Name: ProductOption ProductOption_pkey; Type: CONSTRAINT; Schema: public; Owner: cafex_user
--

ALTER TABLE ONLY public."ProductOption"
    ADD CONSTRAINT "ProductOption_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: cafex_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: ReservationCapacity ReservationCapacity_pkey; Type: CONSTRAINT; Schema: public; Owner: cafex_user
--

ALTER TABLE ONLY public."ReservationCapacity"
    ADD CONSTRAINT "ReservationCapacity_pkey" PRIMARY KEY (id);


--
-- Name: Reservation Reservation_pkey; Type: CONSTRAINT; Schema: public; Owner: cafex_user
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: cafex_user
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog_entity_entityId_idx; Type: INDEX; Schema: public; Owner: cafex_user
--

CREATE INDEX "AuditLog_entity_entityId_idx" ON public."AuditLog" USING btree (entity, "entityId");


--
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: cafex_user
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- Name: Coupon_code_key; Type: INDEX; Schema: public; Owner: cafex_user
--

CREATE UNIQUE INDEX "Coupon_code_key" ON public."Coupon" USING btree (code);


--
-- Name: Order_idempotencyKey_key; Type: INDEX; Schema: public; Owner: cafex_user
--

CREATE UNIQUE INDEX "Order_idempotencyKey_key" ON public."Order" USING btree ("idempotencyKey");


--
-- Name: Order_orderNumber_key; Type: INDEX; Schema: public; Owner: cafex_user
--

CREATE UNIQUE INDEX "Order_orderNumber_key" ON public."Order" USING btree ("orderNumber");


--
-- Name: Order_status_createdAt_idx; Type: INDEX; Schema: public; Owner: cafex_user
--

CREATE INDEX "Order_status_createdAt_idx" ON public."Order" USING btree (status, "createdAt");


--
-- Name: Payment_providerPaymentId_key; Type: INDEX; Schema: public; Owner: cafex_user
--

CREATE UNIQUE INDEX "Payment_providerPaymentId_key" ON public."Payment" USING btree ("providerPaymentId");


--
-- Name: Product_categoryId_isAvailable_idx; Type: INDEX; Schema: public; Owner: cafex_user
--

CREATE INDEX "Product_categoryId_isAvailable_idx" ON public."Product" USING btree ("categoryId", "isAvailable");


--
-- Name: Product_slug_key; Type: INDEX; Schema: public; Owner: cafex_user
--

CREATE UNIQUE INDEX "Product_slug_key" ON public."Product" USING btree (slug);


--
-- Name: ReservationCapacity_dayOfWeek_timeSlot_key; Type: INDEX; Schema: public; Owner: cafex_user
--

CREATE UNIQUE INDEX "ReservationCapacity_dayOfWeek_timeSlot_key" ON public."ReservationCapacity" USING btree ("dayOfWeek", "timeSlot");


--
-- Name: Reservation_date_timeSlot_status_idx; Type: INDEX; Schema: public; Owner: cafex_user
--

CREATE INDEX "Reservation_date_timeSlot_status_idx" ON public."Reservation" USING btree (date, "timeSlot", status);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: cafex_user
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: AuditLog AuditLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cafex_user
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OrderItemOptionSnapshot OrderItemOptionSnapshot_orderItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cafex_user
--

ALTER TABLE ONLY public."OrderItemOptionSnapshot"
    ADD CONSTRAINT "OrderItemOptionSnapshot_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES public."OrderItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cafex_user
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cafex_user
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cafex_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Payment Payment_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cafex_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductOptionGroup ProductOptionGroup_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cafex_user
--

ALTER TABLE ONLY public."ProductOptionGroup"
    ADD CONSTRAINT "ProductOptionGroup_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductOption ProductOption_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cafex_user
--

ALTER TABLE ONLY public."ProductOption"
    ADD CONSTRAINT "ProductOption_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public."ProductOptionGroup"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cafex_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Reservation Reservation_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cafex_user
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict qkp9iopM1Fptd3NN0HsGnUWRDJY5EjrVM5g4GU7sdUa9mRcRJaLwzBnHG5nRSOH

