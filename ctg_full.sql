--
-- PostgreSQL database dump
--

\restrict 3Uxa2sCd63MgfGcwz5OvVnacpNjrb3Whu1Tcjlb0SxGdwFjVKrqRlT8LgzTmq0J

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Address; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Address" (
    id text NOT NULL,
    "userId" text,
    "guestEmail" text,
    name text NOT NULL,
    phone text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    district text NOT NULL,
    "postalCode" text,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Announcement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Announcement" (
    id text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    type text DEFAULT 'info'::text NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    "targetAudience" text DEFAULT 'all'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "startDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endDate" timestamp(3) without time zone,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: AnnouncementDismissal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AnnouncementDismissal" (
    id text NOT NULL,
    "announcementId" text NOT NULL,
    "userId" text,
    "sessionId" text,
    "dismissedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Cart; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Cart" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: CartItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CartItem" (
    id text NOT NULL,
    "cartId" text NOT NULL,
    "productId" text NOT NULL,
    "variantId" text,
    quantity integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    image text,
    "parentId" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ChatMessage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ChatMessage" (
    id text NOT NULL,
    "sessionId" text NOT NULL,
    "senderType" text NOT NULL,
    "senderId" text,
    "senderName" text NOT NULL,
    message text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ChatRestriction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ChatRestriction" (
    id text NOT NULL,
    "sessionId" text NOT NULL,
    "userId" text,
    "restrictedUntil" timestamp(3) without time zone NOT NULL,
    reason text,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ChatSession; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ChatSession" (
    id text NOT NULL,
    "sessionId" text NOT NULL,
    "userId" text,
    "customerName" text DEFAULT 'Guest'::text NOT NULL,
    "customerEmail" text,
    status text DEFAULT 'active'::text NOT NULL,
    "assignedTo" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ContactMessage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ContactMessage" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    subject text NOT NULL,
    message text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "isReplied" boolean DEFAULT false NOT NULL,
    "adminNotes" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Coupon; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Coupon" (
    id text NOT NULL,
    code text NOT NULL,
    description text,
    "discountType" text NOT NULL,
    "discountValue" double precision NOT NULL,
    "minOrderValue" double precision,
    "maxDiscount" double precision,
    "validFrom" timestamp(3) without time zone NOT NULL,
    "validUntil" timestamp(3) without time zone NOT NULL,
    "usageLimit" integer,
    "usedCount" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: FlashSale; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."FlashSale" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "discountPercent" double precision NOT NULL,
    "startTime" timestamp(3) without time zone NOT NULL,
    "endTime" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: FlashSaleProduct; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."FlashSaleProduct" (
    id text NOT NULL,
    "flashSaleId" text NOT NULL,
    "productId" text NOT NULL
);


--
-- Name: InventoryLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."InventoryLog" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "variantId" text,
    "previousStock" integer NOT NULL,
    "newStock" integer NOT NULL,
    change integer NOT NULL,
    reason text NOT NULL,
    "orderId" text,
    "userId" text NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: LoyaltyPoints; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LoyaltyPoints" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "lifetimePoints" integer DEFAULT 0 NOT NULL,
    "lifetimeSpent" double precision DEFAULT 0 NOT NULL,
    "redeemedPoints" integer DEFAULT 0 NOT NULL,
    "tierId" text,
    "tierUpdatedAt" timestamp(3) without time zone,
    "totalPoints" integer DEFAULT 0 NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: LoyaltySettings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LoyaltySettings" (
    id text NOT NULL,
    "isEnabled" boolean DEFAULT true NOT NULL,
    "pointsPerTaka" double precision DEFAULT 0.1 NOT NULL,
    "pointsToTakaRatio" double precision DEFAULT 10 NOT NULL,
    "referralBonusReferrer" integer DEFAULT 100 NOT NULL,
    "referralBonusReferred" integer DEFAULT 50 NOT NULL,
    "minimumRedeemPoints" integer DEFAULT 100 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: LoyaltyTier; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LoyaltyTier" (
    id text NOT NULL,
    name text NOT NULL,
    "displayName" text NOT NULL,
    "minSpending" double precision NOT NULL,
    "discountPercent" double precision DEFAULT 0 NOT NULL,
    "freeShipping" boolean DEFAULT false NOT NULL,
    "freeShippingMin" double precision,
    "pointsMultiplier" double precision DEFAULT 1 NOT NULL,
    "prioritySupport" boolean DEFAULT false NOT NULL,
    "earlyAccess" boolean DEFAULT false NOT NULL,
    "exclusiveDeals" boolean DEFAULT false NOT NULL,
    "birthdayBonus" integer DEFAULT 0 NOT NULL,
    color text DEFAULT '#CD7F32'::text NOT NULL,
    icon text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: NewsletterSubscriber; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."NewsletterSubscriber" (
    id text NOT NULL,
    email text NOT NULL,
    source text,
    "discountCode" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "confirmedAt" timestamp(3) without time zone,
    "unsubscribedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: NewsletterSubscription; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."NewsletterSubscription" (
    id text NOT NULL,
    email text NOT NULL,
    name text,
    "isActive" boolean DEFAULT true NOT NULL,
    "subscribedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "unsubscribedAt" timestamp(3) without time zone
);


--
-- Name: Notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    link text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Order; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "orderNumber" text NOT NULL,
    "userId" text,
    "guestEmail" text,
    "addressId" text NOT NULL,
    subtotal double precision NOT NULL,
    "shippingCost" double precision NOT NULL,
    discount double precision DEFAULT 0 NOT NULL,
    total double precision NOT NULL,
    "couponCode" text,
    status text DEFAULT 'pending'::text NOT NULL,
    "paymentMethod" text NOT NULL,
    "paymentStatus" text DEFAULT 'pending'::text NOT NULL,
    "trackingNumber" text,
    notes text,
    "pointsEarned" integer DEFAULT 0 NOT NULL,
    "pointsRedeemed" integer DEFAULT 0 NOT NULL,
    "paymentConfirmedAt" timestamp(3) without time zone,
    "receiptSentAt" timestamp(3) without time zone,
    "receiptUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    name text,
    phone text
);


--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text NOT NULL,
    "variantInfo" text,
    quantity integer NOT NULL,
    price double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Payment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Payment" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "transactionId" text,
    method text NOT NULL,
    amount double precision NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "gatewayResponse" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: PointsTransaction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PointsTransaction" (
    id text NOT NULL,
    "userId" text NOT NULL,
    points integer NOT NULL,
    type text NOT NULL,
    "orderId" text,
    description text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone,
    "loyaltyId" text NOT NULL
);


--
-- Name: Product; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text NOT NULL,
    "categoryId" text NOT NULL,
    "basePrice" double precision NOT NULL,
    "salePrice" double precision,
    images text NOT NULL,
    "isFeatured" boolean DEFAULT false NOT NULL,
    "isBestseller" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "sizeGuide" text,
    "hasWarranty" boolean DEFAULT false NOT NULL,
    "warrantyPeriod" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ProductAnswer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ProductAnswer" (
    id text NOT NULL,
    "questionId" text NOT NULL,
    "userId" text NOT NULL,
    answer text NOT NULL,
    "isOfficial" boolean DEFAULT false NOT NULL,
    "isVisible" boolean DEFAULT true NOT NULL,
    upvotes integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ProductComparison; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ProductComparison" (
    id text NOT NULL,
    "sessionId" text NOT NULL,
    "userId" text,
    "productIds" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ProductQuestion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ProductQuestion" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "userId" text NOT NULL,
    question text NOT NULL,
    "isAnswered" boolean DEFAULT false NOT NULL,
    "isVisible" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ProductVariant; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ProductVariant" (
    id text NOT NULL,
    "productId" text NOT NULL,
    sku text NOT NULL,
    size text,
    color text,
    stock integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Referral; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Referral" (
    id text NOT NULL,
    "referrerId" text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "referralCode" text NOT NULL,
    "referredBonus" integer DEFAULT 0 NOT NULL,
    "referredId" text NOT NULL,
    "referrerBonus" integer DEFAULT 0 NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Review; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Review" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "userId" text NOT NULL,
    rating integer NOT NULL,
    comment text,
    "isApproved" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SiteSettings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SiteSettings" (
    id text DEFAULT 'default'::text NOT NULL,
    "chatStatus" text DEFAULT 'online'::text NOT NULL,
    "promoEnabled" boolean DEFAULT true NOT NULL,
    "promoCode" text DEFAULT 'WELCOME10'::text NOT NULL,
    "promoMessage" text DEFAULT '🎉 FLASH SALE! Use code WELCOME10 for 10% OFF'::text NOT NULL,
    "promoEndTime" timestamp(3) without time zone,
    "storeName" text DEFAULT 'CTG Collection'::text NOT NULL,
    "storeEmail" text DEFAULT 'info@ctgcollection.com'::text NOT NULL,
    "storePhone" text DEFAULT '+880 1234 567890'::text NOT NULL,
    "storeAddress" text DEFAULT 'Chittagong, Bangladesh'::text NOT NULL,
    "shippingCost" double precision DEFAULT 60 NOT NULL,
    "freeShippingMin" double precision DEFAULT 2000 NOT NULL,
    "codEnabled" boolean DEFAULT true NOT NULL,
    "sslEnabled" boolean DEFAULT true NOT NULL,
    "pointsPerTaka" double precision DEFAULT 0.01 NOT NULL,
    "pointsValue" double precision DEFAULT 0.1 NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Testimonial; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Testimonial" (
    id text NOT NULL,
    "userId" text,
    name text NOT NULL,
    email text,
    avatar text,
    content text NOT NULL,
    rating integer DEFAULT 5 NOT NULL,
    location text,
    "isApproved" boolean DEFAULT false NOT NULL,
    "isFeatured" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text,
    name text NOT NULL,
    phone text,
    role text DEFAULT 'customer'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdById" text,
    "googleId" text,
    "referralCode" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "emailVerified" boolean DEFAULT false NOT NULL,
    "twoFactorEnabled" boolean DEFAULT false NOT NULL,
    "twoFactorMethod" text,
    "verificationExpiry" timestamp(3) without time zone,
    "verificationToken" text
);


--
-- Name: VerificationCode; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."VerificationCode" (
    id text NOT NULL,
    code text NOT NULL,
    type text NOT NULL,
    "userId" text,
    email text,
    phone text,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    used boolean DEFAULT false NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Wishlist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Wishlist" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "productId" text NOT NULL,
    "shareToken" text,
    "isPublic" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Data for Name: Address; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Address" (id, "userId", "guestEmail", name, phone, address, city, district, "postalCode", "isDefault", "createdAt", "updatedAt") FROM stdin;
485f5771-8a38-47a1-8581-2685e078ed79	05a7621a-5570-4452-acb4-1b00c782584c	\N	John Doe	+8801812345678	123 Main Street, Apartment 4B	Chittagong	Chittagong	4000	t	2025-12-15 05:14:01.073	2025-12-15 05:14:01.073
addr-240f94f1-11ef-49f2-8005-1ffc62c256cd	240f94f1-11ef-49f2-8005-1ffc62c256cd	\N	Parvin Islam	+880 019 55688243	House 57, Road 13, Gulshan	Dhaka	Dhaka	1212	t	2025-12-15 06:05:00.053	2025-12-15 06:05:00.053
addr-f4e7be0f-0db2-4710-927c-32028dd9bff1	f4e7be0f-0db2-4710-927c-32028dd9bff1	\N	Imran Sen	+880 013 43393782	House 53, Road 17, Agrabad	Chittagong	Chittagong	4100	t	2025-12-15 06:05:00.125	2025-12-15 06:05:00.125
addr-cd06bce5-c109-41e0-a5df-f72dae9d4fbf	cd06bce5-c109-41e0-a5df-f72dae9d4fbf	\N	Jamal Biswas	+880 018 17826112	House 19, Road 25, Zindabazar	Sylhet	Sylhet	3100	t	2025-12-15 06:05:00.192	2025-12-15 06:05:00.192
addr-62342b6c-2fd9-41c4-9ac4-9aa964069539	62342b6c-2fd9-41c4-9ac4-9aa964069539	\N	Miah Ghosh	+880 015 77462022	House 53, Road 25, Banani	Dhaka	Dhaka	1213	t	2025-12-15 06:05:00.262	2025-12-15 06:05:00.262
addr-38efac26-843d-495e-ab0a-4621dec4c866	38efac26-843d-495e-ab0a-4621dec4c866	\N	Nasir Miah	+880 019 30378367	House 44, Road 14, Banani	Dhaka	Dhaka	1213	t	2025-12-15 06:05:00.334	2025-12-15 06:05:00.334
addr-ef7c44fd-6860-4488-9a24-8c1e32ce3d90	ef7c44fd-6860-4488-9a24-8c1e32ce3d90	\N	Shakil Karim	+880 018 64814070	House 70, Road 12, Uttara	Dhaka	Dhaka	1230	t	2025-12-15 06:05:00.41	2025-12-15 06:05:00.41
addr-251337d7-de77-4f6f-9aab-6b22f4e60783	251337d7-de77-4f6f-9aab-6b22f4e60783	\N	Jasmine Alam	+880 017 27199623	House 30, Road 16, Gulshan	Dhaka	Dhaka	1212	t	2025-12-15 06:05:00.484	2025-12-15 06:05:00.484
addr-e0a7d00f-b7d0-4569-b74f-66e65223df44	e0a7d00f-b7d0-4569-b74f-66e65223df44	\N	Nusrat Ghosh	+880 017 84442838	House 56, Road 22, Zindabazar	Sylhet	Sylhet	3100	t	2025-12-15 06:05:00.557	2025-12-15 06:05:00.557
addr-9d1581dd-ac3f-4b03-a76e-b782a438e611	9d1581dd-ac3f-4b03-a76e-b782a438e611	\N	Kabir Paul	+880 016 75522974	House 53, Road 21, Shaheb Bazar	Rajshahi	Rajshahi	6100	t	2025-12-15 06:05:00.632	2025-12-15 06:05:00.632
addr-6f7c4b1a-20e6-48e6-ab58-1daf35cd3767	6f7c4b1a-20e6-48e6-ab58-1daf35cd3767	\N	Ali Sen	+880 015 30732188	House 52, Road 9, Agrabad	Chittagong	Chittagong	4100	t	2025-12-15 06:05:00.707	2025-12-15 06:05:00.707
addr-50c56248-cf47-41c0-9f14-118cba706f6b	50c56248-cf47-41c0-9f14-118cba706f6b	\N	Imran Sarkar	+880 018 69214902	House 15, Road 7, Mirpur	Dhaka	Dhaka	1216	t	2025-12-15 06:05:00.78	2025-12-15 06:05:00.78
addr-ee95e632-ea0d-475f-8dbf-5ce1a4156243	ee95e632-ea0d-475f-8dbf-5ce1a4156243	\N	Shahana Khan	+880 015 17639535	House 43, Road 16, Khalishpur	Khulna	Khulna	9100	t	2025-12-15 06:05:00.854	2025-12-15 06:05:00.854
addr-d0a2d960-3846-4352-b224-edb3fc081c09	d0a2d960-3846-4352-b224-edb3fc081c09	\N	Fatima Chakraborty	+880 013 53080834	House 64, Road 15, Mirpur	Dhaka	Dhaka	1216	t	2025-12-15 06:05:00.921	2025-12-15 06:05:00.921
addr-0ac00050-d7da-47d9-b711-a3c0bc3ed525	0ac00050-d7da-47d9-b711-a3c0bc3ed525	\N	Chowdhury Chowdhury	+880 018 95904489	House 9, Road 12, Uttara	Dhaka	Dhaka	1230	t	2025-12-15 06:05:00.989	2025-12-15 06:05:00.989
addr-41f390c0-b7d2-4eb6-a69c-ea04b1a61178	41f390c0-b7d2-4eb6-a69c-ea04b1a61178	\N	Karim Choudhury	+880 017 14970084	House 38, Road 14, Mirpur	Dhaka	Dhaka	1216	t	2025-12-15 06:05:01.056	2025-12-15 06:05:01.056
addr-993e360b-d5fd-4277-9080-aee02215087b	993e360b-d5fd-4277-9080-aee02215087b	\N	Bibi Das	+880 017 28699393	House 74, Road 4, Shaheb Bazar	Rajshahi	Rajshahi	6100	t	2025-12-15 06:05:01.125	2025-12-15 06:05:01.125
addr-4cf89320-b8f5-411c-9437-0720bb452873	4cf89320-b8f5-411c-9437-0720bb452873	\N	Jasmine Sen	+880 018 33556250	House 56, Road 15, Nasirabad	Chittagong	Chittagong	4210	t	2025-12-15 06:05:01.196	2025-12-15 06:05:01.196
addr-db1da04f-9d6a-49cc-93da-e9d464fdc12e	db1da04f-9d6a-49cc-93da-e9d464fdc12e	\N	Rani Majumdar	+880 018 73862989	House 59, Road 18, Agrabad	Chittagong	Chittagong	4100	t	2025-12-15 06:05:01.264	2025-12-15 06:05:01.264
addr-40e0ed3e-b486-442e-9aff-1a3279656d4c	40e0ed3e-b486-442e-9aff-1a3279656d4c	\N	Razia Sheikh	+880 016 33174192	House 28, Road 22, Nasirabad	Chittagong	Chittagong	4210	t	2025-12-15 06:05:01.331	2025-12-15 06:05:01.331
addr-e5054dbf-8709-4fd6-b793-0db56e06d29d	e5054dbf-8709-4fd6-b793-0db56e06d29d	\N	Polash Miah	+880 018 12491817	House 81, Road 26, Banani	Dhaka	Dhaka	1213	t	2025-12-15 06:05:01.404	2025-12-15 06:05:01.404
addr-ae65a2a1-3889-4de9-882b-37c2ef483b39	ae65a2a1-3889-4de9-882b-37c2ef483b39	\N	Jasmine Dey	+880 017 29433596	House 5, Road 5, Mirpur	Dhaka	Dhaka	1216	t	2025-12-15 06:05:01.477	2025-12-15 06:05:01.477
addr-abca15a8-b229-45b8-95b0-eac4a0b2e03a	abca15a8-b229-45b8-95b0-eac4a0b2e03a	\N	Salim Haque	+880 019 16576095	House 74, Road 27, Zindabazar	Sylhet	Sylhet	3100	t	2025-12-15 06:05:01.544	2025-12-15 06:05:01.544
addr-9dc3e8c7-f09c-4f9e-90df-3150a6fb01ef	9dc3e8c7-f09c-4f9e-90df-3150a6fb01ef	\N	Ali Paul	+880 019 24333859	House 69, Road 18, Shaheb Bazar	Rajshahi	Rajshahi	6100	t	2025-12-15 06:05:01.613	2025-12-15 06:05:01.613
addr-16b1bc56-5776-462d-9d08-04f25e2d2bc2	16b1bc56-5776-462d-9d08-04f25e2d2bc2	\N	Rubel Mondal	+880 019 20967972	House 89, Road 21, Mirpur	Dhaka	Dhaka	1216	t	2025-12-15 06:05:01.685	2025-12-15 06:05:01.685
addr-4e8eef34-8718-4f23-a509-542ec8db53ee	4e8eef34-8718-4f23-a509-542ec8db53ee	\N	Rahman Ghosh	+880 013 39611785	House 41, Road 30, Khalishpur	Khulna	Khulna	9100	t	2025-12-15 06:05:01.752	2025-12-15 06:05:01.752
addr-98b88282-3117-403f-9015-55008d48d6bb	98b88282-3117-403f-9015-55008d48d6bb	\N	Rahim Mondal	+880 019 30821803	House 50, Road 5, Khalishpur	Khulna	Khulna	9100	t	2025-12-15 06:05:01.819	2025-12-15 06:05:01.819
addr-06a37035-0283-43f7-84b6-65763f0aa343	06a37035-0283-43f7-84b6-65763f0aa343	\N	Rubel Roy	+880 013 32865764	House 55, Road 25, Banani	Dhaka	Dhaka	1213	t	2025-12-15 06:05:01.887	2025-12-15 06:05:01.887
addr-ef8869ce-6a88-477a-9d1a-89e5d2295e85	ef8869ce-6a88-477a-9d1a-89e5d2295e85	\N	Miah Talukdar	+880 018 28021493	House 98, Road 25, Agrabad	Chittagong	Chittagong	4100	t	2025-12-15 06:05:01.952	2025-12-15 06:05:01.952
addr-6e81d257-7dbb-4fbe-931a-5da65f3afdf2	6e81d257-7dbb-4fbe-931a-5da65f3afdf2	\N	Lima Karim	+880 016 31959412	House 41, Road 28, Dhanmondi	Dhaka	Dhaka	1205	t	2025-12-15 06:05:02.018	2025-12-15 06:05:02.018
addr-b437102f-173e-400c-8182-1618ec31c5b4	b437102f-173e-400c-8182-1618ec31c5b4	\N	Shathi Majumdar	+880 019 16454899	House 62, Road 2, Dhanmondi	Dhaka	Dhaka	1205	t	2025-12-15 06:05:02.086	2025-12-15 06:05:02.086
addr-678e0979-cb77-4563-b7bc-9c129a01464d	678e0979-cb77-4563-b7bc-9c129a01464d	\N	Nasir Haque	+880 016 83959301	House 14, Road 29, Dhanmondi	Dhaka	Dhaka	1205	t	2025-12-15 06:05:02.153	2025-12-15 06:05:02.153
addr-85d0a95b-85f0-487e-b703-19fdc93dcffb	85d0a95b-85f0-487e-b703-19fdc93dcffb	\N	Rani Pal	+880 015 42049879	House 49, Road 3, Nasirabad	Chittagong	Chittagong	4210	t	2025-12-15 06:05:02.222	2025-12-15 06:05:02.222
addr-f89488e6-a248-43e3-9cc6-41ce7df2cb3c	f89488e6-a248-43e3-9cc6-41ce7df2cb3c	\N	Kabir Miah	+880 017 33116952	House 39, Road 30, Uttara	Dhaka	Dhaka	1230	t	2025-12-15 06:05:02.288	2025-12-15 06:05:02.288
addr-1f989822-2116-43c4-bbd8-3a808ef70271	1f989822-2116-43c4-bbd8-3a808ef70271	\N	Khatun Sen	+880 013 35074423	House 99, Road 7, Gulshan	Dhaka	Dhaka	1212	t	2025-12-15 06:05:02.352	2025-12-15 06:05:02.352
addr-0eef5330-a8c8-4ace-a95d-94bbdfff9539	0eef5330-a8c8-4ace-a95d-94bbdfff9539	\N	Rubel Ali	+880 019 84960280	House 54, Road 15, Dhanmondi	Dhaka	Dhaka	1205	t	2025-12-15 06:05:02.422	2025-12-15 06:05:02.422
addr-16f26372-9ced-4794-815b-0a0c18897215	16f26372-9ced-4794-815b-0a0c18897215	\N	Jewel Chakraborty	+880 016 46212159	House 68, Road 25, Banani	Dhaka	Dhaka	1213	t	2025-12-15 06:05:02.493	2025-12-15 06:05:02.493
addr-81b767d6-e84f-4385-92bf-f15a916dde42	81b767d6-e84f-4385-92bf-f15a916dde42	\N	Islam Rahman	+880 013 57490411	House 5, Road 17, Mirpur	Dhaka	Dhaka	1216	t	2025-12-15 06:05:02.56	2025-12-15 06:05:02.56
addr-0e9e570a-f363-482e-a9a9-a71a6175e6b5	0e9e570a-f363-482e-a9a9-a71a6175e6b5	\N	Jamal Mondal	+880 015 18794477	House 91, Road 4, Banani	Dhaka	Dhaka	1213	t	2025-12-15 06:05:02.627	2025-12-15 06:05:02.627
addr-8870f26c-4761-4abc-ad9f-bebe0eb9abc6	8870f26c-4761-4abc-ad9f-bebe0eb9abc6	\N	Hasan Sikder	+880 016 43438941	House 56, Road 6, Agrabad	Chittagong	Chittagong	4100	t	2025-12-15 06:05:02.699	2025-12-15 06:05:02.699
addr-331f6371-7157-4cbd-ac01-fd62863bded1	331f6371-7157-4cbd-ac01-fd62863bded1	\N	Begum Uddin	+880 017 61505221	House 11, Road 27, Gulshan	Dhaka	Dhaka	1212	t	2025-12-15 06:05:02.767	2025-12-15 06:05:02.767
addr-5edb6f6c-c198-4062-8c94-7927101c9b73	5edb6f6c-c198-4062-8c94-7927101c9b73	\N	Nusrat Khan	+880 015 91572512	House 96, Road 10, Uttara	Dhaka	Dhaka	1230	t	2025-12-15 06:05:02.834	2025-12-15 06:05:02.834
addr-8da64474-9e3c-4b25-92be-110755341c6e	8da64474-9e3c-4b25-92be-110755341c6e	\N	Nusrat Ali	+880 019 60827470	House 18, Road 20, Uttara	Dhaka	Dhaka	1230	t	2025-12-15 06:05:02.902	2025-12-15 06:05:02.902
addr-e0aa0e2a-de56-4aed-a518-8d504f5a0686	e0aa0e2a-de56-4aed-a518-8d504f5a0686	\N	Nila Choudhury	+880 016 98336292	House 51, Road 22, Banani	Dhaka	Dhaka	1213	t	2025-12-15 06:05:02.977	2025-12-15 06:05:02.977
addr-6b038fbe-c62b-4a14-a9c5-5fdc2a5fc660	6b038fbe-c62b-4a14-a9c5-5fdc2a5fc660	\N	Mitu Pal	+880 015 97875858	House 98, Road 25, Nasirabad	Chittagong	Chittagong	4210	t	2025-12-15 06:05:03.049	2025-12-15 06:05:03.049
addr-e32882e5-26ff-48b1-b420-3b6cabb6f991	e32882e5-26ff-48b1-b420-3b6cabb6f991	\N	Fatima Sikder	+880 013 17525677	House 15, Road 2, Banani	Dhaka	Dhaka	1213	t	2025-12-15 06:05:03.12	2025-12-15 06:05:03.12
addr-7b570776-9d6c-4eab-8fc5-86aad69c4e5a	7b570776-9d6c-4eab-8fc5-86aad69c4e5a	\N	Jewel Karim	+880 013 44191030	House 16, Road 16, Agrabad	Chittagong	Chittagong	4100	t	2025-12-15 06:05:03.191	2025-12-15 06:05:03.191
addr-91861a95-0e9d-47ca-b8ff-4352d39f7556	91861a95-0e9d-47ca-b8ff-4352d39f7556	\N	Fatima Barman	+880 018 66158716	House 79, Road 10, Gulshan	Dhaka	Dhaka	1212	t	2025-12-15 06:05:03.263	2025-12-15 06:05:03.263
addr-39c99a8e-0d67-4067-993e-e4b360d395d3	39c99a8e-0d67-4067-993e-e4b360d395d3	\N	Tanvir Sen	+880 018 55550315	House 74, Road 7, Nasirabad	Chittagong	Chittagong	4210	t	2025-12-15 06:05:03.333	2025-12-15 06:05:03.333
addr-b0042245-e5bc-43e7-9dd2-17fe143ab2e1	b0042245-e5bc-43e7-9dd2-17fe143ab2e1	\N	Kabir Biswas	+880 016 57117607	House 40, Road 29, Mirpur	Dhaka	Dhaka	1216	t	2025-12-15 06:05:03.402	2025-12-15 06:05:03.402
addr-88f7e15b-ce85-4d2c-89de-db2c2f013613	88f7e15b-ce85-4d2c-89de-db2c2f013613	\N	Akter Sarkar	+880 013 55712713	House 30, Road 14, Shaheb Bazar	Rajshahi	Rajshahi	6100	t	2025-12-15 06:05:03.469	2025-12-15 06:05:03.469
addr-50c69e88-5a8b-4915-8b71-b60320160137	50c69e88-5a8b-4915-8b71-b60320160137	\N	Jahan Chowdhury	+880 016 92194846	House 73, Road 13, Nasirabad	Chittagong	Chittagong	4210	t	2025-12-15 06:05:03.536	2025-12-15 06:05:03.536
addr-9d5658af-2dbc-415e-9a8b-dad82ef995e2	9d5658af-2dbc-415e-9a8b-dad82ef995e2	\N	Razia Pal	+880 019 35173676	House 81, Road 10, Nasirabad	Chittagong	Chittagong	4210	t	2025-12-15 06:05:03.603	2025-12-15 06:05:03.603
addr-821b3860-ed14-40ba-a307-d405469c4c97	821b3860-ed14-40ba-a307-d405469c4c97	\N	Jamal Ali	+880 018 41814421	House 63, Road 7, Gulshan	Dhaka	Dhaka	1212	t	2025-12-15 06:05:03.67	2025-12-15 06:05:03.67
addr-9d552a1a-e51e-4646-babd-19c254470db9	9d552a1a-e51e-4646-babd-19c254470db9	\N	Akter Uddin	+880 017 98480835	House 95, Road 1, Uttara	Dhaka	Dhaka	1230	t	2025-12-15 06:05:03.739	2025-12-15 06:05:03.739
addr-91809555-5cec-4a89-8c3d-dab2d8455e6e	91809555-5cec-4a89-8c3d-dab2d8455e6e	\N	Shila Choudhury	+880 013 40663989	House 83, Road 19, Dhanmondi	Dhaka	Dhaka	1205	t	2025-12-15 06:05:03.81	2025-12-15 06:05:03.81
addr-21c2e2aa-6798-4dd6-9293-69f8dda267bd	21c2e2aa-6798-4dd6-9293-69f8dda267bd	\N	Khatun Majumdar	+880 016 18158969	House 19, Road 12, Nasirabad	Chittagong	Chittagong	4210	t	2025-12-15 06:05:03.879	2025-12-15 06:05:03.879
addr-f1492d3b-2cdb-4745-ba96-c3ae6522363e	f1492d3b-2cdb-4745-ba96-c3ae6522363e	\N	Mamun Miah	+880 017 44726539	House 74, Road 19, Mirpur	Dhaka	Dhaka	1216	t	2025-12-15 06:05:03.945	2025-12-15 06:05:03.945
addr-ea49d1b9-7e02-424e-b154-559d3a094cca	ea49d1b9-7e02-424e-b154-559d3a094cca	\N	Salim Haque	+880 013 69451840	House 4, Road 12, Dhanmondi	Dhaka	Dhaka	1205	t	2025-12-15 06:05:04.013	2025-12-15 06:05:04.013
addr-28e7fe4b-7602-405a-b23b-5440c96cf2f6	28e7fe4b-7602-405a-b23b-5440c96cf2f6	\N	Mamun Choudhury	+880 016 42587093	House 2, Road 18, Agrabad	Chittagong	Chittagong	4100	t	2025-12-15 06:05:04.08	2025-12-15 06:05:04.08
addr-d80c524c-3cb6-4791-a232-c323e128db41	d80c524c-3cb6-4791-a232-c323e128db41	\N	Khatun Miah	+880 017 44059246	House 11, Road 2, Nasirabad	Chittagong	Chittagong	4210	t	2025-12-15 06:05:04.149	2025-12-15 06:05:04.149
addr-0208b38f-243b-4eb4-a15a-adcf510eb6ab	0208b38f-243b-4eb4-a15a-adcf510eb6ab	\N	Islam Sheikh	+880 019 12904420	House 81, Road 26, Shaheb Bazar	Rajshahi	Rajshahi	6100	t	2025-12-15 06:07:11.555	2025-12-15 06:07:11.555
addr-098098d1-efed-4325-9b8b-ab4eda7c95cf	098098d1-efed-4325-9b8b-ab4eda7c95cf	\N	Shahana Pal	+880 013 26057590	House 66, Road 14, Banani	Dhaka	Dhaka	1213	t	2025-12-15 06:07:11.632	2025-12-15 06:07:11.632
addr-ce06c857-5d2f-4e0f-851a-8fb29d4a4e68	ce06c857-5d2f-4e0f-851a-8fb29d4a4e68	\N	Shanta Roy	+880 016 40950308	House 53, Road 7, Gulshan	Dhaka	Dhaka	1212	t	2025-12-15 06:07:11.707	2025-12-15 06:07:11.707
addr-f92e1c19-fb9d-4e9e-8663-17380ae426f5	f92e1c19-fb9d-4e9e-8663-17380ae426f5	\N	Rahim Roy	+880 019 34234241	House 60, Road 25, Banani	Dhaka	Dhaka	1213	t	2025-12-15 06:07:11.787	2025-12-15 06:07:11.787
addr-feaf05a6-a6e0-4433-ba1b-5c84b69b6319	feaf05a6-a6e0-4433-ba1b-5c84b69b6319	\N	Rahim Khan	+880 018 46429462	House 23, Road 15, Shaheb Bazar	Rajshahi	Rajshahi	6100	t	2025-12-15 06:07:11.868	2025-12-15 06:07:11.868
addr-250716bd-ddd5-4b36-af2c-9b23e34e6de8	250716bd-ddd5-4b36-af2c-9b23e34e6de8	\N	Nasreen Khan	+880 013 59445300	House 22, Road 15, Uttara	Dhaka	Dhaka	1230	t	2025-12-15 06:07:11.939	2025-12-15 06:07:11.939
addr-0bb1ae57-0fa1-4bf5-bd55-0b3401009f9a	0bb1ae57-0fa1-4bf5-bd55-0b3401009f9a	\N	Ayesha Sarkar	+880 019 34406364	House 3, Road 2, Dhanmondi	Dhaka	Dhaka	1205	t	2025-12-15 06:07:12.024	2025-12-15 06:07:12.024
addr-ee88e3f7-7054-40a2-9d23-21c945dc6474	ee88e3f7-7054-40a2-9d23-21c945dc6474	\N	Ahmed Das	+880 018 55333948	House 69, Road 11, Khalishpur	Khulna	Khulna	9100	t	2025-12-15 06:07:12.093	2025-12-15 06:07:12.093
addr-0a5d3440-04ad-4ee5-8152-773d2d0c6e57	0a5d3440-04ad-4ee5-8152-773d2d0c6e57	\N	Munni Islam	+880 015 85148664	House 79, Road 12, Mirpur	Dhaka	Dhaka	1216	t	2025-12-15 06:07:12.165	2025-12-15 06:07:12.165
addr-359bfe60-8e7a-4faf-a491-a917962462ed	359bfe60-8e7a-4faf-a491-a917962462ed	\N	Devi Mondal	+880 015 63155148	House 63, Road 29, Shaheb Bazar	Rajshahi	Rajshahi	6100	t	2025-12-15 06:07:12.233	2025-12-15 06:07:12.233
addr-499ac6f8-9edd-4e73-98aa-331ad236236d	499ac6f8-9edd-4e73-98aa-331ad236236d	\N	Sheikh Rahman	+880 019 58603893	House 67, Road 5, Shaheb Bazar	Rajshahi	Rajshahi	6100	t	2025-12-15 06:07:12.301	2025-12-15 06:07:12.301
addr-ee97c8e6-72be-45e4-90e8-2e677e2900ba	ee97c8e6-72be-45e4-90e8-2e677e2900ba	\N	Jamal Majumdar	+880 016 88833725	House 16, Road 3, Agrabad	Chittagong	Chittagong	4100	t	2025-12-15 06:07:12.37	2025-12-15 06:07:12.37
addr-67d2041c-f3a6-475c-b584-e99a8fb298bc	67d2041c-f3a6-475c-b584-e99a8fb298bc	\N	Islam Ali	+880 015 49383693	House 96, Road 21, Agrabad	Chittagong	Chittagong	4100	t	2025-12-15 06:07:12.439	2025-12-15 06:07:12.439
addr-b03284d2-218d-432b-a77d-f764bbfd304e	b03284d2-218d-432b-a77d-f764bbfd304e	\N	Taslima Pal	+880 013 66248028	House 31, Road 5, Mirpur	Dhaka	Dhaka	1216	t	2025-12-15 06:07:12.507	2025-12-15 06:07:12.507
addr-8cbc54d9-a2ed-49da-ac2e-89b1f36bd971	8cbc54d9-a2ed-49da-ac2e-89b1f36bd971	\N	Shanta Sikder	+880 016 37529029	House 94, Road 14, Mirpur	Dhaka	Dhaka	1216	t	2025-12-15 06:07:12.574	2025-12-15 06:07:12.574
addr-b4078525-a9d1-49c9-a499-f5cdb35e4f79	b4078525-a9d1-49c9-a499-f5cdb35e4f79	\N	Chowdhury Sen	+880 019 71529226	House 6, Road 17, Uttara	Dhaka	Dhaka	1230	t	2025-12-15 06:07:12.644	2025-12-15 06:07:12.644
addr-f8d766c8-cae7-4adc-9fba-5b8ef4f490b6	f8d766c8-cae7-4adc-9fba-5b8ef4f490b6	\N	Tania Karim	+880 017 41153668	House 45, Road 17, Gulshan	Dhaka	Dhaka	1212	t	2025-12-15 06:07:12.71	2025-12-15 06:07:12.71
addr-bd9c0e28-7e83-4d2f-b305-6ca753285863	bd9c0e28-7e83-4d2f-b305-6ca753285863	\N	Lima Rahman	+880 015 48018096	House 60, Road 21, Zindabazar	Sylhet	Sylhet	3100	t	2025-12-15 06:07:12.782	2025-12-15 06:07:12.782
addr-bcdfc058-552c-41ac-9e3a-41d69ef82889	bcdfc058-552c-41ac-9e3a-41d69ef82889	\N	Islam Sen	+880 018 72335905	House 22, Road 11, Agrabad	Chittagong	Chittagong	4100	t	2025-12-15 06:07:12.852	2025-12-15 06:07:12.852
addr-3d5bf72b-356b-470a-9a55-3f9c3c65fc7e	3d5bf72b-356b-470a-9a55-3f9c3c65fc7e	\N	Begum Roy	+880 015 59915117	House 34, Road 4, Uttara	Dhaka	Dhaka	1230	t	2025-12-15 06:07:12.917	2025-12-15 06:07:12.917
addr-656cf357-0996-48c4-b979-17548a9c8246	656cf357-0996-48c4-b979-17548a9c8246	\N	Akter Ahmed	+880 017 99251664	House 22, Road 15, Khalishpur	Khulna	Khulna	9100	t	2025-12-15 06:07:12.986	2025-12-15 06:07:12.986
addr-10db7aa7-f020-4330-859a-242c9e75ed0c	10db7aa7-f020-4330-859a-242c9e75ed0c	\N	Shathi Karim	+880 018 36662627	House 45, Road 6, Agrabad	Chittagong	Chittagong	4100	t	2025-12-15 06:07:13.054	2025-12-15 06:07:13.054
addr-c9637d45-92f4-4ae3-af80-f268f3296743	c9637d45-92f4-4ae3-af80-f268f3296743	\N	Kabir Sarkar	+880 018 53111354	House 57, Road 23, Dhanmondi	Dhaka	Dhaka	1205	t	2025-12-15 06:07:13.122	2025-12-15 06:07:13.122
addr-a5744bb0-7620-4c95-80af-3827663949b0	a5744bb0-7620-4c95-80af-3827663949b0	\N	Rafiq Choudhury	+880 017 51815987	House 4, Road 16, Zindabazar	Sylhet	Sylhet	3100	t	2025-12-15 06:07:13.188	2025-12-15 06:07:13.188
addr-ad536c6d-f828-40d8-ab36-6e15114c0ad5	ad536c6d-f828-40d8-ab36-6e15114c0ad5	\N	Parvin Choudhury	+880 018 52496821	House 87, Road 22, Nasirabad	Chittagong	Chittagong	4210	t	2025-12-15 06:07:13.254	2025-12-15 06:07:13.254
addr-1a2afc62-4e5b-40c4-be4f-9594bcd76ee8	1a2afc62-4e5b-40c4-be4f-9594bcd76ee8	\N	Farhan Miah	+880 019 40933392	House 48, Road 5, Gulshan	Dhaka	Dhaka	1212	t	2025-12-15 06:07:13.323	2025-12-15 06:07:13.323
addr-d179d185-7203-4900-92d4-38f0fb454eaa	d179d185-7203-4900-92d4-38f0fb454eaa	\N	Mahfuz Sen	+880 019 35945607	House 38, Road 12, Zindabazar	Sylhet	Sylhet	3100	t	2025-12-15 06:07:13.388	2025-12-15 06:07:13.388
addr-f580fd63-099a-444f-99d5-d3b84e2be8b7	f580fd63-099a-444f-99d5-d3b84e2be8b7	\N	Mitu Sarkar	+880 016 20686964	House 50, Road 1, Shaheb Bazar	Rajshahi	Rajshahi	6100	t	2025-12-15 06:07:13.456	2025-12-15 06:07:13.456
addr-a6fd7eda-f51f-4b4f-9910-ce468b563683	a6fd7eda-f51f-4b4f-9910-ce468b563683	\N	Nasreen Paul	+880 017 42223979	House 63, Road 30, Khalishpur	Khulna	Khulna	9100	t	2025-12-15 06:07:13.526	2025-12-15 06:07:13.526
addr-fe7d991e-6571-4f23-b408-a83ad731980f	fe7d991e-6571-4f23-b408-a83ad731980f	\N	Karim Ali	+880 018 93741659	House 44, Road 27, Agrabad	Chittagong	Chittagong	4100	t	2025-12-15 06:07:13.594	2025-12-15 06:07:13.594
addr-b70cbae3-e5bf-43ed-b6b9-0b8a121d44c7	b70cbae3-e5bf-43ed-b6b9-0b8a121d44c7	\N	Polash Biswas	+880 019 24202644	House 93, Road 20, Dhanmondi	Dhaka	Dhaka	1205	t	2025-12-15 06:07:13.661	2025-12-15 06:07:13.661
addr-8595976b-b062-4123-9de4-ad6e5d3c5f8f	8595976b-b062-4123-9de4-ad6e5d3c5f8f	\N	Polash Uddin	+880 019 23544291	House 72, Road 15, Dhanmondi	Dhaka	Dhaka	1205	t	2025-12-15 06:07:13.727	2025-12-15 06:07:13.727
addr-8de439ee-45c9-4c34-97b0-3929b3fc3751	8de439ee-45c9-4c34-97b0-3929b3fc3751	\N	Nila Sen	+880 019 34274843	House 66, Road 11, Dhanmondi	Dhaka	Dhaka	1205	t	2025-12-15 06:07:13.793	2025-12-15 06:07:13.793
addr-b94d4a6a-c619-4b42-8023-70ea6def0191	b94d4a6a-c619-4b42-8023-70ea6def0191	\N	Imran Ahmed	+880 013 14185849	House 16, Road 2, Agrabad	Chittagong	Chittagong	4100	t	2025-12-15 06:07:13.86	2025-12-15 06:07:13.86
addr-b223f02e-fe45-4fd4-b85e-38a81efc0352	b223f02e-fe45-4fd4-b85e-38a81efc0352	\N	Mahfuz Saha	+880 016 16734759	House 94, Road 28, Agrabad	Chittagong	Chittagong	4100	t	2025-12-15 06:07:13.924	2025-12-15 06:07:13.924
addr-2f340d4c-b613-4b0e-b061-b042917b7fa8	2f340d4c-b613-4b0e-b061-b042917b7fa8	\N	Islam Islam	+880 017 91083798	House 30, Road 5, Dhanmondi	Dhaka	Dhaka	1205	t	2025-12-15 06:07:13.99	2025-12-15 06:07:13.99
addr-e7f1ff1c-00ab-48e5-88b6-5683c7aee694	e7f1ff1c-00ab-48e5-88b6-5683c7aee694	\N	Mitu Pal	+880 019 79340511	House 41, Road 30, Nasirabad	Chittagong	Chittagong	4210	t	2025-12-15 06:07:14.059	2025-12-15 06:07:14.059
addr-0becbf6c-29c7-4fc0-a574-63147195f6d6	0becbf6c-29c7-4fc0-a574-63147195f6d6	\N	Mamun Karim	+880 015 77104539	House 70, Road 8, Banani	Dhaka	Dhaka	1213	t	2025-12-15 06:07:14.133	2025-12-15 06:07:14.133
addr-8cc80208-a930-4a79-941c-4d7b274bba23	8cc80208-a930-4a79-941c-4d7b274bba23	\N	Shakil Sikder	+880 013 60267045	House 14, Road 23, Dhanmondi	Dhaka	Dhaka	1205	t	2025-12-15 06:07:14.201	2025-12-15 06:07:14.201
addr-c9899f43-1363-42ee-8298-f205e86f7b6d	c9899f43-1363-42ee-8298-f205e86f7b6d	\N	Shila Ali	+880 017 21740219	House 25, Road 29, Khalishpur	Khulna	Khulna	9100	t	2025-12-15 06:07:14.272	2025-12-15 06:07:14.272
addr-19b0f63e-9095-44e8-a065-0df57b8552e0	19b0f63e-9095-44e8-a065-0df57b8552e0	\N	Parvin Talukdar	+880 017 25940323	House 58, Road 8, Khalishpur	Khulna	Khulna	9100	t	2025-12-15 06:07:14.344	2025-12-15 06:07:14.344
addr-726df130-935c-4df6-a670-8b6e2cbaa6e5	726df130-935c-4df6-a670-8b6e2cbaa6e5	\N	Fatima Majumdar	+880 015 91714581	House 68, Road 29, Banani	Dhaka	Dhaka	1213	t	2025-12-15 06:07:14.411	2025-12-15 06:07:14.411
addr-95bf01d2-4894-44ea-a433-51757fcd312a	95bf01d2-4894-44ea-a433-51757fcd312a	\N	Sabbir Sikder	+880 016 76238120	House 85, Road 21, Uttara	Dhaka	Dhaka	1230	t	2025-12-15 06:07:14.479	2025-12-15 06:07:14.479
addr-ad9d20cb-45e2-4b1a-897a-25bcebaecd91	ad9d20cb-45e2-4b1a-897a-25bcebaecd91	\N	Rani Mondal	+880 019 76134834	House 70, Road 7, Nasirabad	Chittagong	Chittagong	4210	t	2025-12-15 06:07:14.548	2025-12-15 06:07:14.548
addr-3495e913-f6a6-4fea-97e2-9db6539b3cb0	3495e913-f6a6-4fea-97e2-9db6539b3cb0	\N	Moni Chowdhury	+880 019 28167731	House 88, Road 21, Gulshan	Dhaka	Dhaka	1212	t	2025-12-15 06:07:14.617	2025-12-15 06:07:14.617
addr-78be32f0-60e4-433e-9c9f-3eb00aca0c15	78be32f0-60e4-433e-9c9f-3eb00aca0c15	\N	Shathi Islam	+880 017 25549983	House 57, Road 29, Nasirabad	Chittagong	Chittagong	4210	t	2025-12-15 06:07:14.687	2025-12-15 06:07:14.687
addr-6d531e0d-2386-42bc-89fb-073e65971e71	6d531e0d-2386-42bc-89fb-073e65971e71	\N	Ahmed Rahman	+880 015 64666137	House 59, Road 29, Gulshan	Dhaka	Dhaka	1212	t	2025-12-15 06:07:14.754	2025-12-15 06:07:14.754
addr-de5cf121-32a6-4770-adf3-0b557538198c	de5cf121-32a6-4770-adf3-0b557538198c	\N	Shathi Chowdhury	+880 019 84535657	House 88, Road 28, Mirpur	Dhaka	Dhaka	1216	t	2025-12-15 06:07:14.824	2025-12-15 06:07:14.824
addr-bce21961-f3d2-4669-a7fd-8fc87796d5aa	bce21961-f3d2-4669-a7fd-8fc87796d5aa	\N	Chowdhury Bhuiyan	+880 015 92892610	House 88, Road 13, Uttara	Dhaka	Dhaka	1230	t	2025-12-15 06:07:14.895	2025-12-15 06:07:14.895
addr-dc75a227-1451-4970-8c6e-dd1d8d642c39	dc75a227-1451-4970-8c6e-dd1d8d642c39	\N	Imran Ahmed	+880 016 46981392	House 99, Road 3, Mirpur	Dhaka	Dhaka	1216	t	2025-12-15 06:07:14.968	2025-12-15 06:07:14.968
addr-1924006f-c962-45b9-b3a2-ec620b25f3c3	1924006f-c962-45b9-b3a2-ec620b25f3c3	\N	Mitu Alam	+880 016 54486604	House 42, Road 17, Khalishpur	Khulna	Khulna	9100	t	2025-12-15 06:07:15.035	2025-12-15 06:07:15.035
addr-08ebf2f5-2360-4360-bc35-021aacff67c5	08ebf2f5-2360-4360-bc35-021aacff67c5	\N	Shathi Sarkar	+880 015 12043121	House 81, Road 29, Uttara	Dhaka	Dhaka	1230	t	2025-12-15 06:07:15.102	2025-12-15 06:07:15.102
addr-ff3b521e-7cf8-4b1e-abc6-c4331f370335	ff3b521e-7cf8-4b1e-abc6-c4331f370335	\N	Sheikh Sikder	+880 015 24486320	House 99, Road 20, Uttara	Dhaka	Dhaka	1230	t	2025-12-15 06:07:15.171	2025-12-15 06:07:15.171
addr-b9556974-0605-4bda-9375-b4d60cae1b1b	b9556974-0605-4bda-9375-b4d60cae1b1b	\N	Ali Choudhury	+880 018 35840272	House 20, Road 13, Khalishpur	Khulna	Khulna	9100	t	2025-12-15 06:07:15.238	2025-12-15 06:07:15.238
addr-675afddc-5083-438c-9555-924372882c9f	675afddc-5083-438c-9555-924372882c9f	\N	Nusrat Karim	+880 017 10612324	House 90, Road 28, Shaheb Bazar	Rajshahi	Rajshahi	6100	t	2025-12-15 06:07:15.305	2025-12-15 06:07:15.305
addr-144e45aa-b35d-42f9-907d-57ef361f0c20	144e45aa-b35d-42f9-907d-57ef361f0c20	\N	Rabeya Majumdar	+880 019 25148754	House 65, Road 24, Mirpur	Dhaka	Dhaka	1216	t	2025-12-15 06:07:15.372	2025-12-15 06:07:15.372
addr-9bd94bf0-50b5-46bf-a74b-decf9920aafd	9bd94bf0-50b5-46bf-a74b-decf9920aafd	\N	Chowdhury Islam	+880 018 43810331	House 18, Road 3, Gulshan	Dhaka	Dhaka	1212	t	2025-12-15 06:07:15.44	2025-12-15 06:07:15.44
addr-0f6680fc-f156-4fbb-91a5-7315119925b5	0f6680fc-f156-4fbb-91a5-7315119925b5	\N	Razia Chakraborty	+880 016 25653248	House 58, Road 27, Khalishpur	Khulna	Khulna	9100	t	2025-12-15 06:07:15.505	2025-12-15 06:07:15.505
addr-4868b96d-acaf-498a-9fb7-392f737f6ec5	4868b96d-acaf-498a-9fb7-392f737f6ec5	\N	Tariq Ghosh	+880 015 27649327	House 54, Road 27, Mirpur	Dhaka	Dhaka	1216	t	2025-12-15 06:07:15.571	2025-12-15 06:07:15.571
addr-610a5143-bb0d-40ab-9ca5-11f0bbc709e8	610a5143-bb0d-40ab-9ca5-11f0bbc709e8	\N	Tania Uddin	+880 015 41361002	House 32, Road 9, Shaheb Bazar	Rajshahi	Rajshahi	6100	t	2025-12-15 06:07:15.641	2025-12-15 06:07:15.641
addr-cacaf261-e176-466a-b124-70a34f628b21	cacaf261-e176-466a-b124-70a34f628b21	\N	Sheikh Das	+880 013 23748757	House 2, Road 21, Shaheb Bazar	Rajshahi	Rajshahi	6100	t	2025-12-15 06:10:26.496	2025-12-15 06:10:26.496
addr-7e96d919-6a3b-41c0-ac9b-d0340a808141	7e96d919-6a3b-41c0-ac9b-d0340a808141	\N	Begum Majumdar	+880 015 33849720	House 42, Road 22, Agrabad	Chittagong	Chittagong	4100	t	2025-12-15 06:10:26.564	2025-12-15 06:10:26.564
addr-e1832547-c18d-4e59-97e8-6be90134f79f	e1832547-c18d-4e59-97e8-6be90134f79f	\N	Mahfuz Choudhury	+880 019 66409430	House 99, Road 27, Dhanmondi	Dhaka	Dhaka	1205	t	2025-12-15 06:10:26.631	2025-12-15 06:10:26.631
addr-ee55aa7e-d993-478b-9358-8ae92ab384e7	ee55aa7e-d993-478b-9358-8ae92ab384e7	\N	Jahan Karim	+880 017 99517323	House 58, Road 7, Zindabazar	Sylhet	Sylhet	3100	t	2025-12-15 06:10:26.698	2025-12-15 06:10:26.698
addr-e02e823d-4c88-4e0e-ab2f-c3deaf5d5054	e02e823d-4c88-4e0e-ab2f-c3deaf5d5054	\N	Sheikh Sen	+880 017 20352493	House 60, Road 23, Dhanmondi	Dhaka	Dhaka	1205	t	2025-12-15 06:10:26.766	2025-12-15 06:10:26.766
addr-28dacd71-92c1-4fd9-b901-69d2f1c296d6	28dacd71-92c1-4fd9-b901-69d2f1c296d6	\N	Jahan Haque	+880 017 71508076	House 86, Road 24, Agrabad	Chittagong	Chittagong	4100	t	2025-12-15 06:10:26.84	2025-12-15 06:10:26.84
addr-a6384e8c-7ad0-4a2e-b7eb-54e60a4cfbb3	a6384e8c-7ad0-4a2e-b7eb-54e60a4cfbb3	\N	Jahan Pal	+880 013 47468655	House 97, Road 24, Uttara	Dhaka	Dhaka	1230	t	2025-12-15 06:10:26.909	2025-12-15 06:10:26.909
addr-6a283b81-620e-45b9-ab17-42f8fffcb506	6a283b81-620e-45b9-ab17-42f8fffcb506	\N	Jasmine Choudhury	+880 015 57008896	House 23, Road 20, Khalishpur	Khulna	Khulna	9100	t	2025-12-15 06:10:26.977	2025-12-15 06:10:26.977
addr-d5fbfece-c5d0-4ebd-a38b-7cf6a1663129	d5fbfece-c5d0-4ebd-a38b-7cf6a1663129	\N	Moni Saha	+880 017 90786208	House 14, Road 1, Agrabad	Chittagong	Chittagong	4100	t	2025-12-15 06:10:27.053	2025-12-15 06:10:27.053
addr-56c31414-1843-4b8d-aae4-27c7611065eb	56c31414-1843-4b8d-aae4-27c7611065eb	\N	Moni Talukdar	+880 013 79626004	House 71, Road 9, Shaheb Bazar	Rajshahi	Rajshahi	6100	t	2025-12-15 06:10:27.127	2025-12-15 06:10:27.127
addr-f377a912-8c9c-4adf-b3cc-eb82121dab35	f377a912-8c9c-4adf-b3cc-eb82121dab35	\N	Moni Talukdar	+880 016 20835209	House 38, Road 6, Dhanmondi	Dhaka	Dhaka	1205	t	2025-12-15 06:10:27.197	2025-12-15 06:10:27.197
addr-cfa9fc66-0b56-4ec9-acf5-3cf7a4812759	cfa9fc66-0b56-4ec9-acf5-3cf7a4812759	\N	Chowdhury Mondal	+880 016 83225123	House 30, Road 15, Mirpur	Dhaka	Dhaka	1216	t	2025-12-15 06:10:27.263	2025-12-15 06:10:27.263
addr-e5fbc866-4eca-41dc-9170-9a4b75b13dc5	e5fbc866-4eca-41dc-9170-9a4b75b13dc5	\N	Poly Khan	+880 017 76758487	House 58, Road 6, Zindabazar	Sylhet	Sylhet	3100	t	2025-12-15 06:10:27.338	2025-12-15 06:10:27.338
addr-7dc14a69-9111-4b03-977f-9c9be475ba65	7dc14a69-9111-4b03-977f-9c9be475ba65	\N	Nasreen Biswas	+880 013 40920762	House 88, Road 21, Mirpur	Dhaka	Dhaka	1216	t	2025-12-15 06:10:27.407	2025-12-15 06:10:27.407
addr-b78a9765-a80d-4663-8022-3ad40cbcba50	b78a9765-a80d-4663-8022-3ad40cbcba50	\N	Karim Alam	+880 013 11873986	House 29, Road 5, Shaheb Bazar	Rajshahi	Rajshahi	6100	t	2025-12-15 06:10:27.472	2025-12-15 06:10:27.472
addr-ca037ea4-c593-4b5e-aaff-3c24498903b0	ca037ea4-c593-4b5e-aaff-3c24498903b0	\N	Mahfuz Majumdar	+880 015 46173979	House 81, Road 23, Khalishpur	Khulna	Khulna	9100	t	2025-12-15 06:10:27.544	2025-12-15 06:10:27.544
addr-e4c057d8-f0b9-43ab-97b3-ef17bee43d49	e4c057d8-f0b9-43ab-97b3-ef17bee43d49	\N	Rony Rahman	+880 015 29017169	House 7, Road 23, Dhanmondi	Dhaka	Dhaka	1205	t	2025-12-15 06:10:27.614	2025-12-15 06:10:27.614
addr-915b3c32-a9e6-4bcb-b07b-0826d85d510c	915b3c32-a9e6-4bcb-b07b-0826d85d510c	\N	Keya Saha	+880 017 75911736	House 95, Road 1, Zindabazar	Sylhet	Sylhet	3100	t	2025-12-15 06:10:27.683	2025-12-15 06:10:27.683
addr-16155352-550a-45b2-9e21-aecaf077b9a1	16155352-550a-45b2-9e21-aecaf077b9a1	\N	Khan Dey	+880 015 55074595	House 5, Road 4, Khalishpur	Khulna	Khulna	9100	t	2025-12-15 06:10:27.752	2025-12-15 06:10:27.752
addr-c8e9be52-22c7-49c9-b0e9-713a511d1b85	c8e9be52-22c7-49c9-b0e9-713a511d1b85	\N	Rabeya Pal	+880 019 76457627	House 55, Road 22, Banani	Dhaka	Dhaka	1213	t	2025-12-15 06:10:27.821	2025-12-15 06:10:27.821
addr-584dbc44-045e-48bb-acae-16bea65e12da	584dbc44-045e-48bb-acae-16bea65e12da	\N	Rubel Chakraborty	+880 015 45732884	House 67, Road 22, Khalishpur	Khulna	Khulna	9100	t	2025-12-15 06:10:27.888	2025-12-15 06:10:27.888
addr-28d856f9-b873-4b7b-81fc-f60796d119be	28d856f9-b873-4b7b-81fc-f60796d119be	\N	Rani Karim	+880 016 72161266	House 67, Road 5, Khalishpur	Khulna	Khulna	9100	t	2025-12-15 06:10:27.956	2025-12-15 06:10:27.956
addr-0180a727-6bb9-4124-b41e-6d1d857416c3	0180a727-6bb9-4124-b41e-6d1d857416c3	\N	Bibi Sen	+880 013 44133064	House 12, Road 29, Nasirabad	Chittagong	Chittagong	4210	t	2025-12-15 06:10:28.023	2025-12-15 06:10:28.023
addr-3acbf882-3c3a-49ad-8803-c04505c0b393	3acbf882-3c3a-49ad-8803-c04505c0b393	\N	Jewel Majumdar	+880 016 34002582	House 93, Road 23, Banani	Dhaka	Dhaka	1213	t	2025-12-15 06:10:28.089	2025-12-15 06:10:28.089
addr-99514db7-a4f9-4e28-bfd5-9702f79158ee	99514db7-a4f9-4e28-bfd5-9702f79158ee	\N	Nusrat Haque	+880 016 69099328	House 69, Road 26, Agrabad	Chittagong	Chittagong	4100	t	2025-12-15 06:10:28.156	2025-12-15 06:10:28.156
addr-f2f145ce-c50c-4494-bbe0-76f32c161afb	f2f145ce-c50c-4494-bbe0-76f32c161afb	\N	Rafiq Sen	+880 017 73133142	House 42, Road 23, Zindabazar	Sylhet	Sylhet	3100	t	2025-12-15 06:10:28.221	2025-12-15 06:10:28.221
addr-53c4a37d-1fa1-4a0f-acb3-4d7130be38eb	53c4a37d-1fa1-4a0f-acb3-4d7130be38eb	\N	Khan Sen	+880 018 46251860	House 9, Road 4, Banani	Dhaka	Dhaka	1213	t	2025-12-15 06:10:28.291	2025-12-15 06:10:28.291
addr-555cb39b-a563-405a-bb2c-a05273d13d55	555cb39b-a563-405a-bb2c-a05273d13d55	\N	Khatun Alam	+880 017 38817379	House 76, Road 24, Banani	Dhaka	Dhaka	1213	t	2025-12-15 06:10:28.364	2025-12-15 06:10:28.364
addr-4ba17e91-dd7e-45c6-b250-90d80a45f64e	4ba17e91-dd7e-45c6-b250-90d80a45f64e	\N	Tanvir Rahman	+880 017 72902189	House 22, Road 17, Zindabazar	Sylhet	Sylhet	3100	t	2025-12-15 06:10:28.432	2025-12-15 06:10:28.432
addr-2b8f954b-6350-401e-b9a6-d5219f4d52e5	2b8f954b-6350-401e-b9a6-d5219f4d52e5	\N	Ritu Paul	+880 017 48300692	House 41, Road 20, Mirpur	Dhaka	Dhaka	1216	t	2025-12-15 06:10:28.504	2025-12-15 06:10:28.504
addr-44461494-4417-431e-bf80-16aea20e0d43	44461494-4417-431e-bf80-16aea20e0d43	\N	Farhan Ghosh	+880 015 51069656	House 4, Road 6, Nasirabad	Chittagong	Chittagong	4210	t	2025-12-15 06:10:28.611	2025-12-15 06:10:28.611
addr-f0f8374e-53d2-4073-8601-f54045a4524c	f0f8374e-53d2-4073-8601-f54045a4524c	\N	Jamal Ghosh	+880 013 76649723	House 38, Road 17, Shaheb Bazar	Rajshahi	Rajshahi	6100	t	2025-12-15 06:10:28.704	2025-12-15 06:10:28.704
addr-87591ff3-bae8-43cf-86a2-c04dec93e2b1	87591ff3-bae8-43cf-86a2-c04dec93e2b1	\N	Ali Paul	+880 018 30338290	House 4, Road 9, Uttara	Dhaka	Dhaka	1230	t	2025-12-15 06:10:28.776	2025-12-15 06:10:28.776
addr-e55c6eed-8ba6-4d99-9730-bd9b1e46f6f3	e55c6eed-8ba6-4d99-9730-bd9b1e46f6f3	\N	Rahman Chowdhury	+880 015 72619361	House 99, Road 30, Khalishpur	Khulna	Khulna	9100	t	2025-12-15 06:10:28.844	2025-12-15 06:10:28.844
addr-f22b04f8-469a-4efb-a3ea-4336e9afcdd7	f22b04f8-469a-4efb-a3ea-4336e9afcdd7	\N	Farhan Majumdar	+880 019 27117529	House 95, Road 19, Banani	Dhaka	Dhaka	1213	t	2025-12-15 06:10:28.909	2025-12-15 06:10:28.909
addr-ec002b65-e66b-4d0b-b5cc-98dcf26b1c5a	ec002b65-e66b-4d0b-b5cc-98dcf26b1c5a	\N	Jamal Ahmed	+880 013 62935851	House 59, Road 2, Agrabad	Chittagong	Chittagong	4100	t	2025-12-15 06:10:28.978	2025-12-15 06:10:28.978
addr-d686de62-1f55-49a3-9853-83a6b72372d0	d686de62-1f55-49a3-9853-83a6b72372d0	\N	Shanta Talukdar	+880 016 95945241	House 28, Road 23, Uttara	Dhaka	Dhaka	1230	t	2025-12-15 06:10:29.05	2025-12-15 06:10:29.05
addr-8ba62327-c287-4507-8d09-4a2e7c5c3114	8ba62327-c287-4507-8d09-4a2e7c5c3114	\N	Jewel Chakraborty	+880 013 83986512	House 8, Road 23, Khalishpur	Khulna	Khulna	9100	t	2025-12-15 06:10:29.118	2025-12-15 06:10:29.118
addr-d180319f-4acd-4d4d-81c2-e508dc85f3ae	d180319f-4acd-4d4d-81c2-e508dc85f3ae	\N	Shahana Sarkar	+880 013 30233244	House 55, Road 17, Shaheb Bazar	Rajshahi	Rajshahi	6100	t	2025-12-15 06:10:29.184	2025-12-15 06:10:29.184
addr-13e0124c-701f-4bd5-ad96-5624c881eb4a	13e0124c-701f-4bd5-ad96-5624c881eb4a	\N	Ali Pal	+880 017 22927034	House 56, Road 4, Zindabazar	Sylhet	Sylhet	3100	t	2025-12-15 06:10:29.252	2025-12-15 06:10:29.252
addr-e7213d99-5513-49b2-aadb-79b5ba99c89b	e7213d99-5513-49b2-aadb-79b5ba99c89b	\N	Jamal Bhuiyan	+880 017 90490937	House 92, Road 21, Shaheb Bazar	Rajshahi	Rajshahi	6100	t	2025-12-15 06:10:29.321	2025-12-15 06:10:29.321
addr-fd91b1f8-72d3-4ec7-af08-b1c9c3ce0f54	fd91b1f8-72d3-4ec7-af08-b1c9c3ce0f54	\N	Fatima Roy	+880 015 85292579	House 13, Road 21, Gulshan	Dhaka	Dhaka	1212	t	2025-12-15 06:10:29.391	2025-12-15 06:10:29.391
addr-354532ce-c20c-4fea-8fa7-fb1f5197872e	354532ce-c20c-4fea-8fa7-fb1f5197872e	\N	Mamun Chowdhury	+880 019 19645514	House 6, Road 11, Mirpur	Dhaka	Dhaka	1216	t	2025-12-15 06:10:29.464	2025-12-15 06:10:29.464
addr-cdb4055a-0b51-4671-af3f-38139c53f41d	cdb4055a-0b51-4671-af3f-38139c53f41d	\N	Moni Ghosh	+880 016 66917803	House 40, Road 26, Shaheb Bazar	Rajshahi	Rajshahi	6100	t	2025-12-15 06:10:29.531	2025-12-15 06:10:29.531
addr-98b23ded-b7b9-405c-982c-e67a2c93225d	98b23ded-b7b9-405c-982c-e67a2c93225d	\N	Chowdhury Paul	+880 013 23231350	House 37, Road 9, Nasirabad	Chittagong	Chittagong	4210	t	2025-12-15 06:10:29.603	2025-12-15 06:10:29.603
addr-90d7a5ab-766b-48bc-9627-d6162c134e4e	90d7a5ab-766b-48bc-9627-d6162c134e4e	\N	Salim Saha	+880 016 90472629	House 57, Road 10, Khalishpur	Khulna	Khulna	9100	t	2025-12-15 06:10:29.678	2025-12-15 06:10:29.678
addr-36ec23f0-0bfa-4cb8-9c98-b2d8cfe8d628	36ec23f0-0bfa-4cb8-9c98-b2d8cfe8d628	\N	Khatun Chakraborty	+880 017 74661889	House 36, Road 4, Dhanmondi	Dhaka	Dhaka	1205	t	2025-12-15 06:10:29.745	2025-12-15 06:10:29.745
addr-0e21d655-491d-4d38-a91b-d10090e7c56e	0e21d655-491d-4d38-a91b-d10090e7c56e	\N	Shakil Barman	+880 018 93883978	House 90, Road 30, Shaheb Bazar	Rajshahi	Rajshahi	6100	t	2025-12-15 06:10:29.811	2025-12-15 06:10:29.811
addr-e6ccd072-7e45-456a-8a7b-498383e0c0a9	e6ccd072-7e45-456a-8a7b-498383e0c0a9	\N	Polash Ali	+880 015 89751272	House 66, Road 23, Dhanmondi	Dhaka	Dhaka	1205	t	2025-12-15 06:10:29.879	2025-12-15 06:10:29.879
addr-faa35b83-c487-4cb7-9ba7-1de33d8400af	faa35b83-c487-4cb7-9ba7-1de33d8400af	\N	Parvin Barman	+880 019 21814967	House 34, Road 25, Agrabad	Chittagong	Chittagong	4100	t	2025-12-15 06:10:29.944	2025-12-15 06:10:29.944
addr-e571f4ba-47d8-4d1b-9162-af8c3716225b	e571f4ba-47d8-4d1b-9162-af8c3716225b	\N	Mamun Chowdhury	+880 017 76708322	House 12, Road 15, Khalishpur	Khulna	Khulna	9100	t	2025-12-15 06:10:30.016	2025-12-15 06:10:30.016
addr-614ed139-693c-43e3-85ea-f5f517114acd	614ed139-693c-43e3-85ea-f5f517114acd	\N	Nasir Barman	+880 015 41104367	House 30, Road 23, Shaheb Bazar	Rajshahi	Rajshahi	6100	t	2025-12-15 06:10:30.085	2025-12-15 06:10:30.085
addr-2199f365-a3d2-44d4-9e64-6358e781f963	2199f365-a3d2-44d4-9e64-6358e781f963	\N	Rabeya Paul	+880 019 48190828	House 22, Road 3, Banani	Dhaka	Dhaka	1213	t	2025-12-15 06:10:30.155	2025-12-15 06:10:30.155
addr-e1b51326-0d97-499e-b601-dd1ee3a075c2	e1b51326-0d97-499e-b601-dd1ee3a075c2	\N	Islam Chowdhury	+880 016 16915880	House 57, Road 24, Uttara	Dhaka	Dhaka	1230	t	2025-12-15 06:10:30.224	2025-12-15 06:10:30.224
addr-69afbf86-1ba6-4d32-b705-3f12389b0ef0	69afbf86-1ba6-4d32-b705-3f12389b0ef0	\N	Karim Talukdar	+880 015 96474668	House 65, Road 6, Gulshan	Dhaka	Dhaka	1212	t	2025-12-15 06:10:30.292	2025-12-15 06:10:30.292
addr-36e077cc-60e3-43a8-9510-d764a373f907	36e077cc-60e3-43a8-9510-d764a373f907	\N	Rubel Talukdar	+880 018 27292409	House 98, Road 7, Uttara	Dhaka	Dhaka	1230	t	2025-12-15 06:10:30.36	2025-12-15 06:10:30.36
addr-fe1f1873-9525-4c12-abeb-81edd7cda7cf	fe1f1873-9525-4c12-abeb-81edd7cda7cf	\N	Chowdhury Khan	+880 016 34335508	House 14, Road 9, Banani	Dhaka	Dhaka	1213	t	2025-12-15 06:10:30.432	2025-12-15 06:10:30.432
addr-2a996bda-5066-4dae-87b2-e916834d8cd6	2a996bda-5066-4dae-87b2-e916834d8cd6	\N	Salim Pal	+880 013 33060089	House 83, Road 30, Agrabad	Chittagong	Chittagong	4100	t	2025-12-15 06:10:30.504	2025-12-15 06:10:30.504
addr-10a419f6-88c4-425e-89cd-a6eee1f0fb67	10a419f6-88c4-425e-89cd-a6eee1f0fb67	\N	Moni Uddin	+880 018 30632659	House 72, Road 8, Dhanmondi	Dhaka	Dhaka	1205	t	2025-12-15 06:10:30.573	2025-12-15 06:10:30.573
addr-2c8af084-30e7-447f-9f92-350f9f9d06d5	2c8af084-30e7-447f-9f92-350f9f9d06d5	\N	Nasir Saha	+880 018 69118295	House 49, Road 23, Gulshan	Dhaka	Dhaka	1212	t	2025-12-15 06:10:30.642	2025-12-15 06:10:30.642
a520f0cb-0b2c-4776-a760-79ca039dc982	8f1ab731-ef5f-4393-bea0-0ae0f46c03bd	\N	Eau de Parfum	01991523289	dafdsfasdfsadfafd	asdasd	Dinajpur	21312	f	2025-12-15 10:54:40.034	2025-12-15 10:54:40.034
\.


--
-- Data for Name: Announcement; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Announcement" (id, title, content, type, priority, "targetAudience", "isActive", "startDate", "endDate", "createdBy", "createdAt", "updatedAt") FROM stdin;
0dc6e618-d471-4799-98e8-9cc786a6c639	Updates On NEW LOYALTY SYSTEM !!!!	There are 4 tiers with lots of beneifts ! check out ! 	promo	10	all	t	2025-12-15 10:15:00	2025-12-16 16:16:00	cb58e1a1-c3ee-455a-b8d7-cca6e03bf81b	2025-12-15 16:21:34.703	2025-12-15 16:21:34.703
\.


--
-- Data for Name: AnnouncementDismissal; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AnnouncementDismissal" (id, "announcementId", "userId", "sessionId", "dismissedAt") FROM stdin;
5afe16f4-c532-4372-af06-d2a01c332886	0dc6e618-d471-4799-98e8-9cc786a6c639	\N	1ji56k	2025-12-15 16:21:55.34
4aa6488d-f43c-4287-85ff-ac16136f407b	0dc6e618-d471-4799-98e8-9cc786a6c639	\N	mx2eqn	2025-12-15 16:23:03.555
\.


--
-- Data for Name: Cart; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Cart" (id, "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CartItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CartItem" (id, "cartId", "productId", "variantId", quantity, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Category" (id, name, slug, description, image, "parentId", "isActive", "createdAt", "updatedAt") FROM stdin;
83bc6972-ff69-4db3-8dea-3addc8c72396	Fashion	fashion	Trending fashion items for men and women	\N	\N	t	2025-12-15 05:14:00.976	2025-12-15 05:14:00.976
a7356123-d620-444f-8645-1082ced4487a	Home & Living	home-living	Beautiful items for your home	\N	\N	t	2025-12-15 05:14:00.976	2025-12-15 05:14:00.976
4410af1e-33eb-4e99-a3ce-b60a949f6db0	Beauty	beauty	Premium beauty and skincare products	\N	\N	t	2025-12-15 05:14:00.976	2025-12-15 05:14:00.976
91469a18-dfad-491b-a662-90c265f6edcc	Electronics	electronics	Latest gadgets and electronic devices	\N	\N	t	2025-12-15 05:14:00.976	2025-12-15 05:14:00.976
\.


--
-- Data for Name: ChatMessage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ChatMessage" (id, "sessionId", "senderType", "senderId", "senderName", message, "isRead", "createdAt") FROM stdin;
665b8bf0-1591-4357-82b8-c89fc53c7ee4	36b5d4a5-274e-473d-852b-70c5ef57c565	customer	8f1ab731-ef5f-4393-bea0-0ae0f46c03bd	kawshik Karmakar	hi there	f	2025-12-15 10:55:01.737
3be7a3e5-93a2-4b72-95dd-2ef7b7d7b80c	36b5d4a5-274e-473d-852b-70c5ef57c565	customer	8f1ab731-ef5f-4393-bea0-0ae0f46c03bd	kawshik Karmakar	can you help	f	2025-12-15 10:55:15.48
\.


--
-- Data for Name: ChatRestriction; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ChatRestriction" (id, "sessionId", "userId", "restrictedUntil", reason, "createdBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: ChatSession; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ChatSession" (id, "sessionId", "userId", "customerName", "customerEmail", status, "assignedTo", "createdAt", "updatedAt") FROM stdin;
36b5d4a5-274e-473d-852b-70c5ef57c565	chat_1765795928664_4o1gyr0lz9j	8f1ab731-ef5f-4393-bea0-0ae0f46c03bd	kawshik Karmakar	xyzc11756@gmail.com	active	\N	2025-12-15 10:55:01.735	2025-12-15 10:55:15.48
\.


--
-- Data for Name: ContactMessage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ContactMessage" (id, name, email, phone, subject, message, "isRead", "isReplied", "adminNotes", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Coupon; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Coupon" (id, code, description, "discountType", "discountValue", "minOrderValue", "maxDiscount", "validFrom", "validUntil", "usageLimit", "usedCount", "isActive", "createdAt", "updatedAt") FROM stdin;
80ea3e15-34e8-40e5-a73c-6a265a16eb12	SAVE500	Save 500 BDT on orders above 5000	fixed	500	5000	\N	2025-12-15 05:14:01.066	2026-02-13 05:14:01.066	50	0	t	2025-12-15 05:14:01.07	2025-12-15 05:14:01.07
37d82726-d75b-496d-9745-2b2a24c112c5	WELCOME10	Welcome discount for new customers	percentage	10	1000	\N	2025-12-15 05:14:01.065	2026-03-15 05:14:01.065	100	0	t	2025-12-15 05:14:01.07	2025-12-15 05:14:01.07
\.


--
-- Data for Name: FlashSale; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."FlashSale" (id, name, description, "discountPercent", "startTime", "endTime", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: FlashSaleProduct; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."FlashSaleProduct" (id, "flashSaleId", "productId") FROM stdin;
\.


--
-- Data for Name: InventoryLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."InventoryLog" (id, "productId", "variantId", "previousStock", "newStock", change, reason, "orderId", "userId", notes, "createdAt") FROM stdin;
\.


--
-- Data for Name: LoyaltyPoints; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LoyaltyPoints" (id, "userId", "createdAt", "lifetimePoints", "lifetimeSpent", "redeemedPoints", "tierId", "tierUpdatedAt", "totalPoints", "updatedAt") FROM stdin;
\.


--
-- Data for Name: LoyaltySettings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LoyaltySettings" (id, "isEnabled", "pointsPerTaka", "pointsToTakaRatio", "referralBonusReferrer", "referralBonusReferred", "minimumRedeemPoints", "createdAt", "updatedAt") FROM stdin;
4c3e44a4-768c-40f8-8222-bc7761009a62	t	0.1	1	100	50	100	2025-12-15 15:17:28.16	2025-12-15 16:05:19.723
\.


--
-- Data for Name: LoyaltyTier; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LoyaltyTier" (id, name, "displayName", "minSpending", "discountPercent", "freeShipping", "freeShippingMin", "pointsMultiplier", "prioritySupport", "earlyAccess", "exclusiveDeals", "birthdayBonus", color, icon, "sortOrder", "isActive", "createdAt", "updatedAt") FROM stdin;
1adb0571-9158-428d-9908-3c3121c9ec37	silver	Silver	5000	3	f	3000	1.5	f	f	f	100	#C0C0C0	\N	2	t	2025-12-15 15:17:42.628	2025-12-15 16:03:17.503
f5df3c16-57d4-4ae9-9c1f-71ba9434e15f	gold	Gold	15000	5	t	2000	2	t	t	f	200	#FFD700	\N	3	t	2025-12-15 15:17:42.628	2025-12-15 16:04:19.98
da02d221-891e-4f7b-8b82-7840f245983c	bronze	Bronze	40000	1	t	1500	2.5	t	t	t	50	#CD7F32	\N	1	t	2025-12-15 15:17:42.628	2025-12-15 16:04:36.178
d3252d5c-ad3f-4f1b-a491-a590150fc130	platinum	Platinum	60000	10	t	\N	5	t	t	t	500	#E5E4E2	\N	4	t	2025-12-15 15:17:42.628	2025-12-15 16:04:52.225
\.


--
-- Data for Name: NewsletterSubscriber; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."NewsletterSubscriber" (id, email, source, "discountCode", "isActive", "confirmedAt", "unsubscribedAt", "createdAt", "updatedAt") FROM stdin;
04a5f646-51ff-4848-b774-7fc2883e3128	parvin.islam0@example.com	footer	\N	t	2025-12-15 06:05:04.451	\N	2025-12-15 06:05:04.453	2025-12-15 06:05:04.453
71c71c30-fa93-4345-afef-592aa1473712	imran.sen1@example.com	popup	\N	t	2025-12-15 06:05:04.461	\N	2025-12-15 06:05:04.463	2025-12-15 06:05:04.463
d109bf2a-a293-4829-8ad0-825de80c2a4a	jamal.biswas2@example.com	footer	\N	t	2025-12-15 06:05:04.464	\N	2025-12-15 06:05:04.466	2025-12-15 06:05:04.466
d1eefb4a-3d69-4487-aa4e-aa34e9262900	miah.ghosh3@example.com	popup	\N	t	2025-12-15 06:05:04.467	\N	2025-12-15 06:05:04.469	2025-12-15 06:05:04.469
122e5a4b-220c-4afe-87c6-88eb67401e48	nasir.miah4@example.com	popup	\N	t	2025-12-15 06:05:04.469	\N	2025-12-15 06:05:04.47	2025-12-15 06:05:04.47
f00e78f2-3c55-4d77-8d74-11a272261dc7	shakil.karim5@example.com	footer	\N	t	2025-12-15 06:05:04.47	\N	2025-12-15 06:05:04.472	2025-12-15 06:05:04.472
93f87587-e93b-4e42-afc4-24209792494a	jasmine.alam6@example.com	spin_wheel	\N	t	2025-12-15 06:05:04.471	\N	2025-12-15 06:05:04.473	2025-12-15 06:05:04.473
71bd1ee2-d2b1-43c1-841f-307ce489ea23	nusrat.ghosh7@example.com	spin_wheel	\N	t	2025-12-15 06:05:04.473	\N	2025-12-15 06:05:04.475	2025-12-15 06:05:04.475
c4d7483a-ac7f-4445-a854-649b834ddb82	kabir.paul8@example.com	spin_wheel	\N	t	2025-12-15 06:05:04.474	\N	2025-12-15 06:05:04.476	2025-12-15 06:05:04.476
b20c520b-399d-4aef-b6fb-96cd7e5d12cf	ali.sen9@example.com	spin_wheel	\N	t	2025-12-15 06:05:04.477	\N	2025-12-15 06:05:04.479	2025-12-15 06:05:04.479
494b538d-fc25-4eda-9996-bccd4129f0f4	imran.sarkar10@example.com	footer	\N	t	2025-12-15 06:05:04.481	\N	2025-12-15 06:05:04.483	2025-12-15 06:05:04.483
082c4aa4-b584-4234-82d9-056ce73590bb	shahana.khan11@example.com	spin_wheel	\N	t	2025-12-15 06:05:04.483	\N	2025-12-15 06:05:04.485	2025-12-15 06:05:04.485
24ca5c62-b791-4b56-8d4e-5dd92900f0ca	fatima.chakraborty12@example.com	popup	\N	t	2025-12-15 06:05:04.485	\N	2025-12-15 06:05:04.487	2025-12-15 06:05:04.487
ced19d27-39f0-4682-83c5-26925f3c0fe9	chowdhury.chowdhury13@example.com	popup	\N	t	2025-12-15 06:05:04.487	\N	2025-12-15 06:05:04.488	2025-12-15 06:05:04.488
1f972335-ee1b-4836-a55b-8909114d82c3	karim.choudhury14@example.com	spin_wheel	\N	t	2025-12-15 06:05:04.488	\N	2025-12-15 06:05:04.49	2025-12-15 06:05:04.49
19b4fab4-8b09-4d3f-b0e0-aa4219eb98b4	bibi.das15@example.com	footer	\N	t	2025-12-15 06:05:04.491	\N	2025-12-15 06:05:04.493	2025-12-15 06:05:04.493
e8652bcc-f0fb-404c-97ff-1d5f9fd5dbe1	jasmine.sen16@example.com	footer	\N	t	2025-12-15 06:05:04.494	\N	2025-12-15 06:05:04.496	2025-12-15 06:05:04.496
c6075ed0-5cd8-45f9-b81a-833e49a4d346	rani.majumdar17@example.com	footer	\N	t	2025-12-15 06:05:04.497	\N	2025-12-15 06:05:04.499	2025-12-15 06:05:04.499
c028a254-5edd-4ffc-b3f8-458c7e73f3a4	razia.sheikh18@example.com	spin_wheel	\N	t	2025-12-15 06:05:04.499	\N	2025-12-15 06:05:04.501	2025-12-15 06:05:04.501
75277cb3-92ca-40da-a7f4-c730bdc3ffe4	polash.miah19@example.com	popup	\N	t	2025-12-15 06:05:04.501	\N	2025-12-15 06:05:04.502	2025-12-15 06:05:04.502
acbd3a81-3127-40cd-9414-10f5441166ab	jasmine.dey20@example.com	footer	\N	t	2025-12-15 06:05:04.502	\N	2025-12-15 06:05:04.504	2025-12-15 06:05:04.504
18017329-2658-4a05-ba78-a1cc5c320038	salim.haque21@example.com	footer	\N	t	2025-12-15 06:05:04.504	\N	2025-12-15 06:05:04.506	2025-12-15 06:05:04.506
78d3a59c-f860-4556-99a8-e4fcfd292490	ali.paul22@example.com	footer	\N	t	2025-12-15 06:05:04.507	\N	2025-12-15 06:05:04.509	2025-12-15 06:05:04.509
8fd9e506-8711-4bb3-881a-5b0d737e0a8e	rubel.mondal23@example.com	spin_wheel	\N	t	2025-12-15 06:05:04.511	\N	2025-12-15 06:05:04.513	2025-12-15 06:05:04.513
59ab2566-b4fa-444b-9f0a-6c4532a6808f	rahman.ghosh24@example.com	popup	\N	t	2025-12-15 06:05:04.513	\N	2025-12-15 06:05:04.515	2025-12-15 06:05:04.515
80add3d9-9bd2-462d-adb3-d494303070b5	islam.sheikh0@example.com	footer	\N	t	2025-12-15 06:07:15.884	\N	2025-12-15 06:07:15.885	2025-12-15 06:07:15.885
f54dd2bf-f31e-4586-b5e0-ed9d7d9af66f	shahana.pal1@example.com	popup	\N	t	2025-12-15 06:07:15.887	\N	2025-12-15 06:07:15.888	2025-12-15 06:07:15.888
1946769e-c70c-46dc-a078-aa06c5df1e91	shanta.roy2@example.com	footer	\N	t	2025-12-15 06:07:15.89	\N	2025-12-15 06:07:15.891	2025-12-15 06:07:15.891
93f90ed8-cacd-400f-af11-3a2bb3928b75	rahim.roy3@example.com	footer	\N	t	2025-12-15 06:07:15.892	\N	2025-12-15 06:07:15.893	2025-12-15 06:07:15.893
d9e5c34f-5c3e-4f9e-9e00-64788458013e	rahim.khan4@example.com	popup	\N	t	2025-12-15 06:07:15.894	\N	2025-12-15 06:07:15.895	2025-12-15 06:07:15.895
2385cc1e-7c18-4c0e-a18c-d2f25c876fb7	nasreen.khan5@example.com	popup	\N	t	2025-12-15 06:07:15.895	\N	2025-12-15 06:07:15.896	2025-12-15 06:07:15.896
373b85a7-23d7-4681-a03b-78e3e5c8f789	ayesha.sarkar6@example.com	footer	\N	t	2025-12-15 06:07:15.896	\N	2025-12-15 06:07:15.897	2025-12-15 06:07:15.897
63223911-cc52-4902-9b24-88e97910582c	ahmed.das7@example.com	spin_wheel	\N	t	2025-12-15 06:07:15.898	\N	2025-12-15 06:07:15.898	2025-12-15 06:07:15.898
4facebea-cad3-4bea-9f38-2cdc2b898f51	munni.islam8@example.com	popup	\N	t	2025-12-15 06:07:15.899	\N	2025-12-15 06:07:15.9	2025-12-15 06:07:15.9
1e8ff33e-ae0a-4f6f-bc60-cce8f200bbc8	devi.mondal9@example.com	popup	\N	t	2025-12-15 06:07:15.9	\N	2025-12-15 06:07:15.901	2025-12-15 06:07:15.901
cbd13757-7e7c-42a6-b546-e5fce0e5ff58	sheikh.rahman10@example.com	footer	\N	t	2025-12-15 06:07:15.901	\N	2025-12-15 06:07:15.902	2025-12-15 06:07:15.902
22570365-4c3e-4efa-bd67-715405237046	jamal.majumdar11@example.com	popup	\N	t	2025-12-15 06:07:15.902	\N	2025-12-15 06:07:15.904	2025-12-15 06:07:15.904
82a01741-f8c3-452f-9e16-cc9794370d24	islam.ali12@example.com	popup	\N	t	2025-12-15 06:07:15.906	\N	2025-12-15 06:07:15.907	2025-12-15 06:07:15.907
7e22b29d-3881-4e17-9dbb-34e1994a034c	taslima.pal13@example.com	popup	\N	t	2025-12-15 06:07:15.907	\N	2025-12-15 06:07:15.908	2025-12-15 06:07:15.908
24d1a941-1c54-43a4-a6c9-2bc850f3f12f	shanta.sikder14@example.com	popup	\N	t	2025-12-15 06:07:15.908	\N	2025-12-15 06:07:15.909	2025-12-15 06:07:15.909
09b3d1ae-70f7-44ab-bf22-ba8a544a515f	chowdhury.sen15@example.com	popup	\N	t	2025-12-15 06:07:15.909	\N	2025-12-15 06:07:15.91	2025-12-15 06:07:15.91
fe587feb-c8c2-4228-82f1-6e62e1a23eae	tania.karim16@example.com	spin_wheel	\N	t	2025-12-15 06:07:15.91	\N	2025-12-15 06:07:15.911	2025-12-15 06:07:15.911
d80d594b-bd40-4504-af73-ab9889b70de6	lima.rahman17@example.com	spin_wheel	\N	t	2025-12-15 06:07:15.911	\N	2025-12-15 06:07:15.912	2025-12-15 06:07:15.912
1c86effd-bb30-49c5-9dfd-a2120c806ffa	islam.sen18@example.com	spin_wheel	\N	t	2025-12-15 06:07:15.912	\N	2025-12-15 06:07:15.913	2025-12-15 06:07:15.913
ff643e0a-bb00-4b3d-aa34-02dd4ba084ce	begum.roy19@example.com	popup	\N	t	2025-12-15 06:07:15.913	\N	2025-12-15 06:07:15.914	2025-12-15 06:07:15.914
b2bfbf27-8b1a-465b-a221-c7c8bd596489	akter.ahmed20@example.com	footer	\N	t	2025-12-15 06:07:15.914	\N	2025-12-15 06:07:15.914	2025-12-15 06:07:15.914
450b1b2a-c8aa-4786-8ecb-a83887b3396c	shathi.karim21@example.com	spin_wheel	\N	t	2025-12-15 06:07:15.914	\N	2025-12-15 06:07:15.915	2025-12-15 06:07:15.915
2dcd1aef-7c16-4182-9e0e-884619177fce	kabir.sarkar22@example.com	spin_wheel	\N	t	2025-12-15 06:07:15.915	\N	2025-12-15 06:07:15.916	2025-12-15 06:07:15.916
f7d2edd3-15ea-4f47-9a19-f4dcb6786750	rafiq.choudhury23@example.com	popup	\N	t	2025-12-15 06:07:15.917	\N	2025-12-15 06:07:15.918	2025-12-15 06:07:15.918
9ee23241-861b-4a95-a394-a0bd42c36c22	parvin.choudhury24@example.com	spin_wheel	\N	t	2025-12-15 06:07:15.919	\N	2025-12-15 06:07:15.92	2025-12-15 06:07:15.92
0839df7f-7dd6-4fa4-8e50-740ee86d4115	sheikh.das0@example.com	popup	\N	t	2025-12-15 06:10:30.878	\N	2025-12-15 06:10:30.882	2025-12-15 06:10:30.882
ed5c28cf-4dcc-4210-b1cc-5e1927077b4a	begum.majumdar1@example.com	popup	\N	t	2025-12-15 06:10:30.883	\N	2025-12-15 06:10:30.887	2025-12-15 06:10:30.887
5169e792-d918-4c53-8ed3-14d5131b080c	mahfuz.choudhury2@example.com	popup	\N	t	2025-12-15 06:10:30.887	\N	2025-12-15 06:10:30.891	2025-12-15 06:10:30.891
bc57d3c8-f9c3-4eaa-94e1-dc9035e30dbc	jahan.karim3@example.com	spin_wheel	\N	t	2025-12-15 06:10:30.891	\N	2025-12-15 06:10:30.894	2025-12-15 06:10:30.894
6627df8e-d8ac-44d5-a021-ec7dc40aff76	sheikh.sen4@example.com	spin_wheel	\N	t	2025-12-15 06:10:30.892	\N	2025-12-15 06:10:30.895	2025-12-15 06:10:30.895
3fb0cdbe-466a-4a87-a950-ae433cc28343	jahan.haque5@example.com	spin_wheel	\N	t	2025-12-15 06:10:30.893	\N	2025-12-15 06:10:30.897	2025-12-15 06:10:30.897
54877aae-66ea-41fb-bab6-6ddbd552ebe2	jahan.pal6@example.com	footer	\N	t	2025-12-15 06:10:30.895	\N	2025-12-15 06:10:30.899	2025-12-15 06:10:30.899
3bdeef00-f178-4a9b-832e-282797f1a101	jasmine.choudhury7@example.com	spin_wheel	\N	t	2025-12-15 06:10:30.897	\N	2025-12-15 06:10:30.901	2025-12-15 06:10:30.901
be840bb0-4c05-4d47-a3fb-a08474cc781d	moni.saha8@example.com	popup	\N	t	2025-12-15 06:10:30.902	\N	2025-12-15 06:10:30.905	2025-12-15 06:10:30.905
e8f6f9b0-2ac0-46c9-81b1-1d5e10a2451b	moni.talukdar9@example.com	footer	\N	t	2025-12-15 06:10:30.904	\N	2025-12-15 06:10:30.908	2025-12-15 06:10:30.908
f1257751-2a6e-498c-93e2-b710f2c08ba4	moni.talukdar10@example.com	popup	\N	t	2025-12-15 06:10:30.906	\N	2025-12-15 06:10:30.909	2025-12-15 06:10:30.909
b22d2517-521f-489e-9a3e-a9fa9b2f4832	chowdhury.mondal11@example.com	footer	\N	t	2025-12-15 06:10:30.91	\N	2025-12-15 06:10:30.913	2025-12-15 06:10:30.913
c35aefde-edf7-4b6b-9cc3-6b5bc84f03df	poly.khan12@example.com	spin_wheel	\N	t	2025-12-15 06:10:30.912	\N	2025-12-15 06:10:30.916	2025-12-15 06:10:30.916
046b380a-7f0f-43be-8eaf-c854344ff59e	nasreen.biswas13@example.com	popup	\N	t	2025-12-15 06:10:30.916	\N	2025-12-15 06:10:30.919	2025-12-15 06:10:30.919
94bcb63c-629b-4a4d-b551-1ae800be3349	karim.alam14@example.com	popup	\N	t	2025-12-15 06:10:30.917	\N	2025-12-15 06:10:30.921	2025-12-15 06:10:30.921
f180db08-2f8c-44f6-8561-c5af1134ffae	mahfuz.majumdar15@example.com	footer	\N	t	2025-12-15 06:10:30.919	\N	2025-12-15 06:10:30.922	2025-12-15 06:10:30.922
e3f2cd3a-6fbe-4a91-8245-9f57a8c88b8a	rony.rahman16@example.com	popup	\N	t	2025-12-15 06:10:30.92	\N	2025-12-15 06:10:30.923	2025-12-15 06:10:30.923
ee7bb1bc-0134-43ae-b80c-43e53db152b6	keya.saha17@example.com	spin_wheel	\N	t	2025-12-15 06:10:30.921	\N	2025-12-15 06:10:30.925	2025-12-15 06:10:30.925
674394a6-d46d-447c-bb31-da61c4938ad5	khan.dey18@example.com	spin_wheel	\N	t	2025-12-15 06:10:30.923	\N	2025-12-15 06:10:30.926	2025-12-15 06:10:30.926
551edd6a-7b68-4a21-8143-f411a15a4a61	rabeya.pal19@example.com	popup	\N	t	2025-12-15 06:10:30.924	\N	2025-12-15 06:10:30.927	2025-12-15 06:10:30.927
df3d0f38-5f9e-4f97-88ff-e28dc0aa6c6a	rubel.chakraborty20@example.com	popup	\N	t	2025-12-15 06:10:30.925	\N	2025-12-15 06:10:30.928	2025-12-15 06:10:30.928
f57db88e-0d0e-47a8-a698-c3b9062209c7	rani.karim21@example.com	spin_wheel	\N	t	2025-12-15 06:10:30.927	\N	2025-12-15 06:10:30.931	2025-12-15 06:10:30.931
ba0ded5c-10d0-44d9-bc64-e0bf9ab0bd96	bibi.sen22@example.com	popup	\N	t	2025-12-15 06:10:30.929	\N	2025-12-15 06:10:30.933	2025-12-15 06:10:30.933
e9251e68-455e-409f-b1dd-41aa22fd26e4	jewel.majumdar23@example.com	footer	\N	t	2025-12-15 06:10:30.931	\N	2025-12-15 06:10:30.935	2025-12-15 06:10:30.935
3cf4b788-b90b-4525-b9f8-8949173490f6	nusrat.haque24@example.com	footer	\N	t	2025-12-15 06:10:30.933	\N	2025-12-15 06:10:30.936	2025-12-15 06:10:30.936
43308396-9223-42e1-af36-5629e83c8869	sanim7004@gmail.com	footer	\N	t	2025-12-15 06:31:33.901	\N	2025-12-15 06:31:33.902	2025-12-15 06:31:33.902
39b62bd4-2546-4376-ab9d-d0712412147b	sanim1728@gmail.com	footer	\N	t	2025-12-15 10:59:08.517	\N	2025-12-15 10:59:08.518	2025-12-15 10:59:08.518
0a510662-4ec2-49af-b65a-a7f9becf5634	xyzc11756@gmail.com	footer	\N	t	2025-12-15 11:02:36.096	\N	2025-12-15 11:02:36.097	2025-12-15 11:02:36.097
\.


--
-- Data for Name: NewsletterSubscription; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."NewsletterSubscription" (id, email, name, "isActive", "subscribedAt", "unsubscribedAt") FROM stdin;
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Notification" (id, "userId", type, title, message, "isRead", link, "createdAt") FROM stdin;
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Order" (id, "orderNumber", "userId", "guestEmail", "addressId", subtotal, "shippingCost", discount, total, "couponCode", status, "paymentMethod", "paymentStatus", "trackingNumber", notes, "pointsEarned", "pointsRedeemed", "paymentConfirmedAt", "receiptSentAt", "receiptUrl", "createdAt", "updatedAt", name, phone) FROM stdin;
11a63ed3-8779-4440-98fe-fe62e4fe48a2	ORD-2024-0001	0180a727-6bb9-4124-b41e-6d1d857416c3	\N	addr-0180a727-6bb9-4124-b41e-6d1d857416c3	1899	60	0	1959	\N	pending	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:58.993	2025-12-15 10:48:58.993	Bibi Sen	+880 013 44133064
e80ac6e2-3cd8-42f9-ba0e-ba93e1e1d915	ORD-2024-0002	0208b38f-243b-4eb4-a15a-adcf510eb6ab	\N	addr-0208b38f-243b-4eb4-a15a-adcf510eb6ab	10998	0	0	10998	\N	processing	sslcommerz	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.003	2025-12-15 10:48:59.003	Islam Sheikh	+880 019 12904420
b492d1e3-3bb4-4652-97ec-2a5e328b0a2b	ORD-2024-0003	05a7621a-5570-4452-acb4-1b00c782584c	\N	485f5771-8a38-47a1-8581-2685e078ed79	14997	0	0	14997	\N	shipped	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.005	2025-12-15 10:48:59.005	John Doe	+8801812345678
a55b877a-f03d-4c31-9d4a-721f958f54dc	ORD-2024-0004	06a37035-0283-43f7-84b6-65763f0aa343	\N	addr-06a37035-0283-43f7-84b6-65763f0aa343	4499	0	0	4499	\N	delivered	sslcommerz	paid	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.007	2025-12-15 10:48:59.007	Rubel Roy	+880 013 32865764
c6f18032-2a25-4617-8998-894caea98b39	ORD-2024-0005	08ebf2f5-2360-4360-bc35-021aacff67c5	\N	addr-08ebf2f5-2360-4360-bc35-021aacff67c5	85998	0	0	85998	\N	pending	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.01	2025-12-15 10:48:59.01	Shathi Sarkar	+880 015 12043121
94627cce-c190-4f74-9e38-3ebed3ef4ab5	ORD-2024-0006	098098d1-efed-4325-9b8b-ab4eda7c95cf	\N	addr-098098d1-efed-4325-9b8b-ab4eda7c95cf	2097	0	0	2097	\N	processing	sslcommerz	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.012	2025-12-15 10:48:59.012	Shahana Pal	+880 013 26057590
e4f69fba-063b-4b21-a58e-33d26aaf6653	ORD-2024-0007	0a5d3440-04ad-4ee5-8152-773d2d0c6e57	\N	addr-0a5d3440-04ad-4ee5-8152-773d2d0c6e57	1999	60	0	2059	\N	shipped	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.015	2025-12-15 10:48:59.015	Munni Islam	+880 015 85148664
03a64ad9-6c70-4e19-bbf5-19aa4f94d5f2	ORD-2024-0008	0ac00050-d7da-47d9-b711-a3c0bc3ed525	\N	addr-0ac00050-d7da-47d9-b711-a3c0bc3ed525	12998	0	0	12998	\N	delivered	sslcommerz	paid	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.017	2025-12-15 10:48:59.017	Chowdhury Chowdhury	+880 018 95904489
27ac507c-925f-4e44-a8a1-74eca94455a7	ORD-2024-0009	0bb1ae57-0fa1-4bf5-bd55-0b3401009f9a	\N	addr-0bb1ae57-0fa1-4bf5-bd55-0b3401009f9a	11997	0	0	11997	\N	pending	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.019	2025-12-15 10:48:59.019	Ayesha Sarkar	+880 019 34406364
c83d02d5-b4f1-42f6-a6da-53a3a23ea61d	ORD-2024-0010	0becbf6c-29c7-4fc0-a574-63147195f6d6	\N	addr-0becbf6c-29c7-4fc0-a574-63147195f6d6	2799	0	0	2799	\N	processing	sslcommerz	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.031	2025-12-15 10:48:59.031	Mamun Karim	+880 015 77104539
1d3444c8-e48b-4444-b7e6-995479c496cf	ORD-2024-0011	0e21d655-491d-4d38-a91b-d10090e7c56e	\N	addr-0e21d655-491d-4d38-a91b-d10090e7c56e	3798	0	0	3798	\N	shipped	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.033	2025-12-15 10:48:59.033	Shakil Barman	+880 018 93883978
84a8b474-0bfa-4534-989e-fe2dc813605f	ORD-2024-0012	0e9e570a-f363-482e-a9a9-a71a6175e6b5	\N	addr-0e9e570a-f363-482e-a9a9-a71a6175e6b5	16497	0	0	16497	\N	delivered	sslcommerz	paid	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.035	2025-12-15 10:48:59.035	Jamal Mondal	+880 015 18794477
4dc3c023-d7b4-46d9-8295-3eee7e160511	ORD-2024-0013	0eef5330-a8c8-4ace-a95d-94bbdfff9539	\N	addr-0eef5330-a8c8-4ace-a95d-94bbdfff9539	4999	0	0	4999	\N	pending	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.037	2025-12-15 10:48:59.037	Rubel Ali	+880 019 84960280
a82d5859-6d83-4299-8e26-23ad90395868	ORD-2024-0014	0f6680fc-f156-4fbb-91a5-7315119925b5	\N	addr-0f6680fc-f156-4fbb-91a5-7315119925b5	8998	0	0	8998	\N	processing	sslcommerz	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.038	2025-12-15 10:48:59.038	Razia Chakraborty	+880 016 25653248
53c1aa31-a707-4839-bf9c-7c260206dadd	ORD-2024-0015	10a419f6-88c4-425e-89cd-a6eee1f0fb67	\N	addr-10a419f6-88c4-425e-89cd-a6eee1f0fb67	128997	0	0	128997	\N	shipped	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.04	2025-12-15 10:48:59.04	Moni Uddin	+880 018 30632659
1f030f85-6891-47c1-a633-aa33211dfb7c	ORD-2024-0016	10db7aa7-f020-4330-859a-242c9e75ed0c	\N	addr-10db7aa7-f020-4330-859a-242c9e75ed0c	699	60	0	759	\N	delivered	sslcommerz	paid	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.042	2025-12-15 10:48:59.042	Shathi Karim	+880 018 36662627
3b0a879e-ce8e-478b-a8ec-16f77d08ae57	ORD-2024-0017	13e0124c-701f-4bd5-ad96-5624c881eb4a	\N	addr-13e0124c-701f-4bd5-ad96-5624c881eb4a	3998	0	0	3998	\N	pending	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.043	2025-12-15 10:48:59.043	Ali Pal	+880 017 22927034
185816c1-1aac-4033-8797-78f05cd9d99b	ORD-2024-0018	144e45aa-b35d-42f9-907d-57ef361f0c20	\N	addr-144e45aa-b35d-42f9-907d-57ef361f0c20	19497	0	0	19497	\N	processing	sslcommerz	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.045	2025-12-15 10:48:59.045	Rabeya Majumdar	+880 019 25148754
c200ff72-0360-407d-a41f-ae758deb2c72	ORD-2024-0019	16155352-550a-45b2-9e21-aecaf077b9a1	\N	addr-16155352-550a-45b2-9e21-aecaf077b9a1	3999	0	0	3999	\N	shipped	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.047	2025-12-15 10:48:59.047	Khan Dey	+880 015 55074595
f79bdbf6-676d-40dc-a710-62bdf1fea093	ORD-2024-0020	16b1bc56-5776-462d-9d08-04f25e2d2bc2	\N	addr-16b1bc56-5776-462d-9d08-04f25e2d2bc2	5598	0	0	5598	\N	delivered	sslcommerz	paid	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.049	2025-12-15 10:48:59.049	Rubel Mondal	+880 019 20967972
51ecb098-67a6-4e7b-b278-6bc0a7667d12	ORD-2024-0021	16f26372-9ced-4794-815b-0a0c18897215	\N	addr-16f26372-9ced-4794-815b-0a0c18897215	5697	0	0	5697	\N	pending	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.051	2025-12-15 10:48:59.051	Jewel Chakraborty	+880 016 46212159
689594ee-6f02-44c7-84b2-daf47013e445	ORD-2024-0022	1924006f-c962-45b9-b3a2-ec620b25f3c3	\N	addr-1924006f-c962-45b9-b3a2-ec620b25f3c3	5499	0	0	5499	\N	processing	sslcommerz	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.054	2025-12-15 10:48:59.054	Mitu Alam	+880 016 54486604
53ade360-6bda-498f-8cc8-4f77a5f49ca0	ORD-2024-0023	19b0f63e-9095-44e8-a065-0df57b8552e0	\N	addr-19b0f63e-9095-44e8-a065-0df57b8552e0	9998	0	0	9998	\N	shipped	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.056	2025-12-15 10:48:59.056	Parvin Talukdar	+880 017 25940323
b9f62599-0b78-4014-9a89-0eff88c43092	ORD-2024-0024	1a2afc62-4e5b-40c4-be4f-9594bcd76ee8	\N	addr-1a2afc62-4e5b-40c4-be4f-9594bcd76ee8	13497	0	0	13497	\N	delivered	sslcommerz	paid	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.057	2025-12-15 10:48:59.057	Farhan Miah	+880 019 40933392
0b6f0f6f-07bb-4fa9-be78-7a0a92153efb	ORD-2024-0025	1f989822-2116-43c4-bbd8-3a808ef70271	\N	addr-1f989822-2116-43c4-bbd8-3a808ef70271	42999	0	0	42999	\N	pending	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.059	2025-12-15 10:48:59.059	Khatun Sen	+880 013 35074423
f8fa1c6a-4f72-4e99-91cc-af577b834f63	ORD-2024-0026	2199f365-a3d2-44d4-9e64-6358e781f963	\N	addr-2199f365-a3d2-44d4-9e64-6358e781f963	1398	60	0	1458	\N	processing	sslcommerz	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.06	2025-12-15 10:48:59.06	Rabeya Paul	+880 019 48190828
13360b57-0835-4e45-9500-bb9f281bf697	ORD-2024-0027	21c2e2aa-6798-4dd6-9293-69f8dda267bd	\N	addr-21c2e2aa-6798-4dd6-9293-69f8dda267bd	5997	0	0	5997	\N	shipped	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.062	2025-12-15 10:48:59.062	Khatun Majumdar	+880 016 18158969
a13164c0-79d1-4218-af9e-b44d90f915d7	ORD-2024-0028	240f94f1-11ef-49f2-8005-1ffc62c256cd	\N	addr-240f94f1-11ef-49f2-8005-1ffc62c256cd	6499	0	0	6499	\N	delivered	sslcommerz	paid	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.063	2025-12-15 10:48:59.063	Parvin Islam	+880 019 55688243
f34b4dfb-8eab-425a-b43d-b26c2ef2f076	ORD-2024-0029	250716bd-ddd5-4b36-af2c-9b23e34e6de8	\N	addr-250716bd-ddd5-4b36-af2c-9b23e34e6de8	7998	0	0	7998	\N	pending	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.065	2025-12-15 10:48:59.065	Nasreen Khan	+880 013 59445300
0154d750-ebab-43de-a8c5-e46b0b862bd3	ORD-2024-0030	251337d7-de77-4f6f-9aab-6b22f4e60783	\N	addr-251337d7-de77-4f6f-9aab-6b22f4e60783	8397	0	0	8397	\N	processing	sslcommerz	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.067	2025-12-15 10:48:59.067	Jasmine Alam	+880 017 27199623
b08be92f-28c8-4b3a-acc0-f73100c4a748	ORD-2024-0031	28d856f9-b873-4b7b-81fc-f60796d119be	\N	addr-28d856f9-b873-4b7b-81fc-f60796d119be	1899	60	0	1959	\N	shipped	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.069	2025-12-15 10:48:59.069	Rani Karim	+880 016 72161266
e4a6fcdb-999c-4985-813d-329cb0563681	ORD-2024-0032	28dacd71-92c1-4fd9-b901-69d2f1c296d6	\N	addr-28dacd71-92c1-4fd9-b901-69d2f1c296d6	10998	0	0	10998	\N	delivered	sslcommerz	paid	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.071	2025-12-15 10:48:59.071	Jahan Haque	+880 017 71508076
f44ed862-cb2c-45b3-8972-c50b7e17ea73	ORD-2024-0033	28e7fe4b-7602-405a-b23b-5440c96cf2f6	\N	addr-28e7fe4b-7602-405a-b23b-5440c96cf2f6	14997	0	0	14997	\N	pending	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.083	2025-12-15 10:48:59.083	Mamun Choudhury	+880 016 42587093
a2872045-793e-46d7-ad53-ef642b31095b	ORD-2024-0034	2a996bda-5066-4dae-87b2-e916834d8cd6	\N	addr-2a996bda-5066-4dae-87b2-e916834d8cd6	4499	0	0	4499	\N	processing	sslcommerz	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.085	2025-12-15 10:48:59.085	Salim Pal	+880 013 33060089
7a095bf9-ccda-46e5-9602-1a6518aafcce	ORD-2024-0035	2b8f954b-6350-401e-b9a6-d5219f4d52e5	\N	addr-2b8f954b-6350-401e-b9a6-d5219f4d52e5	85998	0	0	85998	\N	shipped	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.087	2025-12-15 10:48:59.087	Ritu Paul	+880 017 48300692
7a3d6f70-c45d-4319-8025-d8952b128561	ORD-2024-0036	2c8af084-30e7-447f-9f92-350f9f9d06d5	\N	addr-2c8af084-30e7-447f-9f92-350f9f9d06d5	2097	0	0	2097	\N	delivered	sslcommerz	paid	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.089	2025-12-15 10:48:59.089	Nasir Saha	+880 018 69118295
636edcf8-06ab-4e6f-8a24-9480fea5a5ad	ORD-2024-0037	2f340d4c-b613-4b0e-b061-b042917b7fa8	\N	addr-2f340d4c-b613-4b0e-b061-b042917b7fa8	1999	60	0	2059	\N	pending	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.091	2025-12-15 10:48:59.091	Islam Islam	+880 017 91083798
8ee56ea6-b22e-4c73-9be3-77adde5ee457	ORD-2024-0038	0180a727-6bb9-4124-b41e-6d1d857416c3	\N	addr-0180a727-6bb9-4124-b41e-6d1d857416c3	12998	0	0	12998	\N	processing	sslcommerz	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.093	2025-12-15 10:48:59.093	Bibi Sen	+880 013 44133064
182e1408-a650-4f4d-9e17-6898f38c82e1	ORD-2024-0039	0208b38f-243b-4eb4-a15a-adcf510eb6ab	\N	addr-0208b38f-243b-4eb4-a15a-adcf510eb6ab	11997	0	0	11997	\N	shipped	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.094	2025-12-15 10:48:59.094	Islam Sheikh	+880 019 12904420
f11d61ad-b387-49d7-ba5c-33566aeca240	ORD-2024-0040	05a7621a-5570-4452-acb4-1b00c782584c	\N	485f5771-8a38-47a1-8581-2685e078ed79	2799	0	0	2799	\N	delivered	sslcommerz	paid	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.096	2025-12-15 10:48:59.096	John Doe	+8801812345678
2bd9f4e1-21c3-4ede-a4c4-25fe3c62d5bc	ORD-2024-0041	06a37035-0283-43f7-84b6-65763f0aa343	\N	addr-06a37035-0283-43f7-84b6-65763f0aa343	3798	0	0	3798	\N	pending	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.098	2025-12-15 10:48:59.098	Rubel Roy	+880 013 32865764
a74f0988-b5d8-4d81-9701-15e3ac4e07b7	ORD-2024-0042	08ebf2f5-2360-4360-bc35-021aacff67c5	\N	addr-08ebf2f5-2360-4360-bc35-021aacff67c5	16497	0	0	16497	\N	processing	sslcommerz	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.099	2025-12-15 10:48:59.099	Shathi Sarkar	+880 015 12043121
c29f50e8-de8c-42da-a0ef-f042ccbb2fe8	ORD-2024-0043	098098d1-efed-4325-9b8b-ab4eda7c95cf	\N	addr-098098d1-efed-4325-9b8b-ab4eda7c95cf	4999	0	0	4999	\N	shipped	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.101	2025-12-15 10:48:59.101	Shahana Pal	+880 013 26057590
4f597d01-95ef-49c9-889f-772ffb72595a	ORD-2024-0044	0a5d3440-04ad-4ee5-8152-773d2d0c6e57	\N	addr-0a5d3440-04ad-4ee5-8152-773d2d0c6e57	8998	0	0	8998	\N	delivered	sslcommerz	paid	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.103	2025-12-15 10:48:59.103	Munni Islam	+880 015 85148664
9fce8509-6a94-439c-b926-802d0f9fa0e9	ORD-2024-0045	0ac00050-d7da-47d9-b711-a3c0bc3ed525	\N	addr-0ac00050-d7da-47d9-b711-a3c0bc3ed525	128997	0	0	128997	\N	pending	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.105	2025-12-15 10:48:59.105	Chowdhury Chowdhury	+880 018 95904489
4751de12-f631-4d90-84f4-712021959757	ORD-2024-0046	0bb1ae57-0fa1-4bf5-bd55-0b3401009f9a	\N	addr-0bb1ae57-0fa1-4bf5-bd55-0b3401009f9a	699	60	0	759	\N	processing	sslcommerz	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.107	2025-12-15 10:48:59.107	Ayesha Sarkar	+880 019 34406364
366e1719-9268-4b27-b813-bab612157bee	ORD-2024-0047	0becbf6c-29c7-4fc0-a574-63147195f6d6	\N	addr-0becbf6c-29c7-4fc0-a574-63147195f6d6	3998	0	0	3998	\N	shipped	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.109	2025-12-15 10:48:59.109	Mamun Karim	+880 015 77104539
e7f29a26-e350-4fe1-b981-ece0c743108b	ORD-2024-0048	0e21d655-491d-4d38-a91b-d10090e7c56e	\N	addr-0e21d655-491d-4d38-a91b-d10090e7c56e	19497	0	0	19497	\N	delivered	sslcommerz	paid	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.11	2025-12-15 10:48:59.11	Shakil Barman	+880 018 93883978
f7d55a2e-5078-4420-8f33-68e848b0ce45	ORD-2024-0049	0e9e570a-f363-482e-a9a9-a71a6175e6b5	\N	addr-0e9e570a-f363-482e-a9a9-a71a6175e6b5	3999	0	0	3999	\N	pending	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.112	2025-12-15 10:48:59.112	Jamal Mondal	+880 015 18794477
f897eb3e-202c-491c-bbff-0917674d80ce	ORD-2024-0050	0eef5330-a8c8-4ace-a95d-94bbdfff9539	\N	addr-0eef5330-a8c8-4ace-a95d-94bbdfff9539	5598	0	0	5598	\N	processing	sslcommerz	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.114	2025-12-15 10:48:59.114	Rubel Ali	+880 019 84960280
04e75d54-a013-4f6a-a7ac-43e5da9b3ecb	ORD-2024-0051	0f6680fc-f156-4fbb-91a5-7315119925b5	\N	addr-0f6680fc-f156-4fbb-91a5-7315119925b5	5697	0	0	5697	\N	shipped	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.115	2025-12-15 10:48:59.115	Razia Chakraborty	+880 016 25653248
6c520993-13d0-4c51-adf6-ad3df0869a07	ORD-2024-0052	10a419f6-88c4-425e-89cd-a6eee1f0fb67	\N	addr-10a419f6-88c4-425e-89cd-a6eee1f0fb67	5499	0	0	5499	\N	delivered	sslcommerz	paid	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.131	2025-12-15 10:48:59.131	Moni Uddin	+880 018 30632659
e05d3e08-4105-4f9c-b026-bb2d3fc38566	ORD-2024-0053	10db7aa7-f020-4330-859a-242c9e75ed0c	\N	addr-10db7aa7-f020-4330-859a-242c9e75ed0c	9998	0	0	9998	\N	pending	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.134	2025-12-15 10:48:59.134	Shathi Karim	+880 018 36662627
d1ca76f2-ce49-4563-959e-3c8559df55b1	ORD-2024-0054	13e0124c-701f-4bd5-ad96-5624c881eb4a	\N	addr-13e0124c-701f-4bd5-ad96-5624c881eb4a	13497	0	0	13497	\N	processing	sslcommerz	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.136	2025-12-15 10:48:59.136	Ali Pal	+880 017 22927034
a35cf105-0228-40e9-a2a2-7c4d7a0011ff	ORD-2024-0055	144e45aa-b35d-42f9-907d-57ef361f0c20	\N	addr-144e45aa-b35d-42f9-907d-57ef361f0c20	42999	0	0	42999	\N	shipped	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.138	2025-12-15 10:48:59.138	Rabeya Majumdar	+880 019 25148754
f4102efe-058c-45eb-8ffc-041e975481f8	ORD-2024-0056	16155352-550a-45b2-9e21-aecaf077b9a1	\N	addr-16155352-550a-45b2-9e21-aecaf077b9a1	1398	60	0	1458	\N	delivered	sslcommerz	paid	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.14	2025-12-15 10:48:59.14	Khan Dey	+880 015 55074595
93d0b9da-dc63-49eb-b330-4dae5edb853d	ORD-2024-0057	16b1bc56-5776-462d-9d08-04f25e2d2bc2	\N	addr-16b1bc56-5776-462d-9d08-04f25e2d2bc2	5997	0	0	5997	\N	pending	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.142	2025-12-15 10:48:59.142	Rubel Mondal	+880 019 20967972
79ab094a-28d9-43a2-86c2-ae0bbe58cbaa	ORD-2024-0058	16f26372-9ced-4794-815b-0a0c18897215	\N	addr-16f26372-9ced-4794-815b-0a0c18897215	6499	0	0	6499	\N	processing	sslcommerz	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.144	2025-12-15 10:48:59.144	Jewel Chakraborty	+880 016 46212159
0141ffb9-6846-4893-ba93-0297c8185e75	ORD-2024-0059	1924006f-c962-45b9-b3a2-ec620b25f3c3	\N	addr-1924006f-c962-45b9-b3a2-ec620b25f3c3	7998	0	0	7998	\N	shipped	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.146	2025-12-15 10:48:59.146	Mitu Alam	+880 016 54486604
62321658-7b35-43d0-a446-ee54eb6ab0a0	ORD-2024-0060	19b0f63e-9095-44e8-a065-0df57b8552e0	\N	addr-19b0f63e-9095-44e8-a065-0df57b8552e0	8397	0	0	8397	\N	delivered	sslcommerz	paid	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.147	2025-12-15 10:48:59.147	Parvin Talukdar	+880 017 25940323
95cf8b2d-0283-4fee-90fa-a450ddd38f0e	ORD-2024-0061	1a2afc62-4e5b-40c4-be4f-9594bcd76ee8	\N	addr-1a2afc62-4e5b-40c4-be4f-9594bcd76ee8	1899	60	0	1959	\N	pending	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.149	2025-12-15 10:48:59.149	Farhan Miah	+880 019 40933392
8a454259-da89-4dab-983b-54b354da56f5	ORD-2024-0062	1f989822-2116-43c4-bbd8-3a808ef70271	\N	addr-1f989822-2116-43c4-bbd8-3a808ef70271	10998	0	0	10998	\N	processing	sslcommerz	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.161	2025-12-15 10:48:59.161	Khatun Sen	+880 013 35074423
73164297-7601-4a98-b355-d5f3015aff5b	ORD-2024-0063	2199f365-a3d2-44d4-9e64-6358e781f963	\N	addr-2199f365-a3d2-44d4-9e64-6358e781f963	14997	0	0	14997	\N	shipped	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.164	2025-12-15 10:48:59.164	Rabeya Paul	+880 019 48190828
e939ba45-25b6-4da8-b020-292b85209aa5	ORD-2024-0064	21c2e2aa-6798-4dd6-9293-69f8dda267bd	\N	addr-21c2e2aa-6798-4dd6-9293-69f8dda267bd	4499	0	0	4499	\N	delivered	sslcommerz	paid	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.166	2025-12-15 10:48:59.166	Khatun Majumdar	+880 016 18158969
49a4b4b0-779e-4d55-b072-5de3ab8462c9	ORD-2024-0065	240f94f1-11ef-49f2-8005-1ffc62c256cd	\N	addr-240f94f1-11ef-49f2-8005-1ffc62c256cd	85998	0	0	85998	\N	pending	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.167	2025-12-15 10:48:59.167	Parvin Islam	+880 019 55688243
5fcf7c06-51cf-4f14-816b-8aa0639952f8	ORD-2024-0066	250716bd-ddd5-4b36-af2c-9b23e34e6de8	\N	addr-250716bd-ddd5-4b36-af2c-9b23e34e6de8	2097	0	0	2097	\N	processing	sslcommerz	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.169	2025-12-15 10:48:59.169	Nasreen Khan	+880 013 59445300
b9fa4098-f074-4b4f-9441-d98ec7ae04fa	ORD-2024-0067	251337d7-de77-4f6f-9aab-6b22f4e60783	\N	addr-251337d7-de77-4f6f-9aab-6b22f4e60783	1999	60	0	2059	\N	shipped	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.17	2025-12-15 10:48:59.17	Jasmine Alam	+880 017 27199623
fb6cb73a-bfd2-462f-aa6a-539f682cfd99	ORD-2024-0068	28d856f9-b873-4b7b-81fc-f60796d119be	\N	addr-28d856f9-b873-4b7b-81fc-f60796d119be	12998	0	0	12998	\N	delivered	sslcommerz	paid	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.172	2025-12-15 10:48:59.172	Rani Karim	+880 016 72161266
cd5ec55c-f84c-4346-b019-01146c439d6a	ORD-2024-0069	28dacd71-92c1-4fd9-b901-69d2f1c296d6	\N	addr-28dacd71-92c1-4fd9-b901-69d2f1c296d6	11997	0	0	11997	\N	pending	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.173	2025-12-15 10:48:59.173	Jahan Haque	+880 017 71508076
beaf7269-0fb9-48dd-bded-001b9a2d4230	ORD-2024-0070	28e7fe4b-7602-405a-b23b-5440c96cf2f6	\N	addr-28e7fe4b-7602-405a-b23b-5440c96cf2f6	2799	0	0	2799	\N	processing	sslcommerz	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.174	2025-12-15 10:48:59.174	Mamun Choudhury	+880 016 42587093
5561c833-b4ff-4a60-8f0d-ce9ee1abaf5f	ORD-2024-0071	2a996bda-5066-4dae-87b2-e916834d8cd6	\N	addr-2a996bda-5066-4dae-87b2-e916834d8cd6	3798	0	0	3798	\N	shipped	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.176	2025-12-15 10:48:59.176	Salim Pal	+880 013 33060089
2ae503f5-a3ea-4f52-9218-b8f9c6ce70fc	ORD-2024-0072	2b8f954b-6350-401e-b9a6-d5219f4d52e5	\N	addr-2b8f954b-6350-401e-b9a6-d5219f4d52e5	16497	0	0	16497	\N	delivered	sslcommerz	paid	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.178	2025-12-15 10:48:59.178	Ritu Paul	+880 017 48300692
98c7ea84-e0db-42c2-8318-5c8f8238e5f4	ORD-2024-0073	2c8af084-30e7-447f-9f92-350f9f9d06d5	\N	addr-2c8af084-30e7-447f-9f92-350f9f9d06d5	4999	0	0	4999	\N	pending	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.179	2025-12-15 10:48:59.179	Nasir Saha	+880 018 69118295
9a59164f-d0d4-4ea9-b7e7-c03af5608cf1	ORD-2024-0074	2f340d4c-b613-4b0e-b061-b042917b7fa8	\N	addr-2f340d4c-b613-4b0e-b061-b042917b7fa8	8998	0	0	8998	\N	processing	sslcommerz	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.181	2025-12-15 10:48:59.181	Islam Islam	+880 017 91083798
47ca22bd-d835-44dd-825b-6deb4e9e155d	ORD-2024-0075	0180a727-6bb9-4124-b41e-6d1d857416c3	\N	addr-0180a727-6bb9-4124-b41e-6d1d857416c3	128997	0	0	128997	\N	shipped	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.183	2025-12-15 10:48:59.183	Bibi Sen	+880 013 44133064
5c096719-06ce-4bc2-b070-aed4a4e788d9	ORD-2024-0076	0208b38f-243b-4eb4-a15a-adcf510eb6ab	\N	addr-0208b38f-243b-4eb4-a15a-adcf510eb6ab	699	60	0	759	\N	delivered	sslcommerz	paid	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.185	2025-12-15 10:48:59.185	Islam Sheikh	+880 019 12904420
8038c70d-aa40-42fc-b5b2-26c9c6c9958e	ORD-2024-0077	05a7621a-5570-4452-acb4-1b00c782584c	\N	485f5771-8a38-47a1-8581-2685e078ed79	3998	0	0	3998	\N	pending	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.186	2025-12-15 10:48:59.186	John Doe	+8801812345678
ccc9b30c-3a57-470a-b88f-20c091beb329	ORD-2024-0078	06a37035-0283-43f7-84b6-65763f0aa343	\N	addr-06a37035-0283-43f7-84b6-65763f0aa343	19497	0	0	19497	\N	processing	sslcommerz	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.188	2025-12-15 10:48:59.188	Rubel Roy	+880 013 32865764
66abde23-ff2a-457d-8879-a54dd14d64b2	ORD-2024-0079	08ebf2f5-2360-4360-bc35-021aacff67c5	\N	addr-08ebf2f5-2360-4360-bc35-021aacff67c5	3999	0	0	3999	\N	shipped	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.189	2025-12-15 10:48:59.189	Shathi Sarkar	+880 015 12043121
aa6c35ae-10c8-4890-b579-d76d7061edf6	ORD-2024-0080	098098d1-efed-4325-9b8b-ab4eda7c95cf	\N	addr-098098d1-efed-4325-9b8b-ab4eda7c95cf	5598	0	0	5598	\N	delivered	sslcommerz	paid	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.191	2025-12-15 10:48:59.191	Shahana Pal	+880 013 26057590
e9a6e35e-f68f-4ecf-8473-a162c31eae45	ORD-2024-0081	0a5d3440-04ad-4ee5-8152-773d2d0c6e57	\N	addr-0a5d3440-04ad-4ee5-8152-773d2d0c6e57	5697	0	0	5697	\N	pending	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.193	2025-12-15 10:48:59.193	Munni Islam	+880 015 85148664
13ab2b08-747a-46f4-97be-b083b95f8f51	ORD-2024-0082	0ac00050-d7da-47d9-b711-a3c0bc3ed525	\N	addr-0ac00050-d7da-47d9-b711-a3c0bc3ed525	5499	0	0	5499	\N	processing	sslcommerz	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.196	2025-12-15 10:48:59.196	Chowdhury Chowdhury	+880 018 95904489
085b819e-27ae-49c2-a71a-bc7ef8b31226	ORD-2024-0083	0bb1ae57-0fa1-4bf5-bd55-0b3401009f9a	\N	addr-0bb1ae57-0fa1-4bf5-bd55-0b3401009f9a	9998	0	0	9998	\N	shipped	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.197	2025-12-15 10:48:59.197	Ayesha Sarkar	+880 019 34406364
68dbf4ee-9ea8-451b-a83b-a0ce134fbfc0	ORD-2024-0084	0becbf6c-29c7-4fc0-a574-63147195f6d6	\N	addr-0becbf6c-29c7-4fc0-a574-63147195f6d6	13497	0	0	13497	\N	delivered	sslcommerz	paid	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.199	2025-12-15 10:48:59.199	Mamun Karim	+880 015 77104539
dde6fb08-4506-4bec-8650-65e78e003cc2	ORD-2024-0085	0e21d655-491d-4d38-a91b-d10090e7c56e	\N	addr-0e21d655-491d-4d38-a91b-d10090e7c56e	42999	0	0	42999	\N	pending	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.2	2025-12-15 10:48:59.2	Shakil Barman	+880 018 93883978
8f92dd78-9377-45e3-a294-59588eae6116	ORD-2024-0086	0e9e570a-f363-482e-a9a9-a71a6175e6b5	\N	addr-0e9e570a-f363-482e-a9a9-a71a6175e6b5	1398	60	0	1458	\N	processing	sslcommerz	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.202	2025-12-15 10:48:59.202	Jamal Mondal	+880 015 18794477
ffb41717-be4e-4b52-878c-1de6a4fe9eb6	ORD-2024-0087	0eef5330-a8c8-4ace-a95d-94bbdfff9539	\N	addr-0eef5330-a8c8-4ace-a95d-94bbdfff9539	5997	0	0	5997	\N	shipped	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.203	2025-12-15 10:48:59.203	Rubel Ali	+880 019 84960280
586e8621-f9f2-4cbf-bd3b-f5051c64274f	ORD-2024-0088	0f6680fc-f156-4fbb-91a5-7315119925b5	\N	addr-0f6680fc-f156-4fbb-91a5-7315119925b5	6499	0	0	6499	\N	delivered	sslcommerz	paid	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.205	2025-12-15 10:48:59.205	Razia Chakraborty	+880 016 25653248
137c661d-ec5d-404f-8019-faee7208f6d1	ORD-2024-0089	10a419f6-88c4-425e-89cd-a6eee1f0fb67	\N	addr-10a419f6-88c4-425e-89cd-a6eee1f0fb67	7998	0	0	7998	\N	pending	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.215	2025-12-15 10:48:59.215	Moni Uddin	+880 018 30632659
f0575d06-33d6-49a6-a8be-8b96c2ebbfb4	ORD-2024-0090	10db7aa7-f020-4330-859a-242c9e75ed0c	\N	addr-10db7aa7-f020-4330-859a-242c9e75ed0c	8397	0	0	8397	\N	processing	sslcommerz	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.217	2025-12-15 10:48:59.217	Shathi Karim	+880 018 36662627
f1e604c8-dbe1-421d-a2ba-634c290ec354	ORD-2024-0091	13e0124c-701f-4bd5-ad96-5624c881eb4a	\N	addr-13e0124c-701f-4bd5-ad96-5624c881eb4a	1899	60	0	1959	\N	shipped	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.219	2025-12-15 10:48:59.219	Ali Pal	+880 017 22927034
74c85e74-55f3-4514-8705-d50f1b371eef	ORD-2024-0092	144e45aa-b35d-42f9-907d-57ef361f0c20	\N	addr-144e45aa-b35d-42f9-907d-57ef361f0c20	10998	0	0	10998	\N	delivered	sslcommerz	paid	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.221	2025-12-15 10:48:59.221	Rabeya Majumdar	+880 019 25148754
cc60aa10-1bb1-4b79-a40a-a5dda2e45dfb	ORD-2024-0093	16155352-550a-45b2-9e21-aecaf077b9a1	\N	addr-16155352-550a-45b2-9e21-aecaf077b9a1	14997	0	0	14997	\N	pending	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.223	2025-12-15 10:48:59.223	Khan Dey	+880 015 55074595
d720612e-afe5-47dc-9a1b-9745330ae503	ORD-2024-0094	16b1bc56-5776-462d-9d08-04f25e2d2bc2	\N	addr-16b1bc56-5776-462d-9d08-04f25e2d2bc2	4499	0	0	4499	\N	processing	sslcommerz	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.224	2025-12-15 10:48:59.224	Rubel Mondal	+880 019 20967972
363b3581-4598-4050-84c0-b5c47b1a11f4	ORD-2024-0095	16f26372-9ced-4794-815b-0a0c18897215	\N	addr-16f26372-9ced-4794-815b-0a0c18897215	85998	0	0	85998	\N	shipped	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.226	2025-12-15 10:48:59.226	Jewel Chakraborty	+880 016 46212159
919617b3-4ae6-4518-b760-00663412eba9	ORD-2024-0096	1924006f-c962-45b9-b3a2-ec620b25f3c3	\N	addr-1924006f-c962-45b9-b3a2-ec620b25f3c3	2097	0	0	2097	\N	delivered	sslcommerz	paid	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.228	2025-12-15 10:48:59.228	Mitu Alam	+880 016 54486604
ae977e60-4b80-41b2-8acc-ff69f64f3d1a	ORD-2024-0097	19b0f63e-9095-44e8-a065-0df57b8552e0	\N	addr-19b0f63e-9095-44e8-a065-0df57b8552e0	1999	60	0	2059	\N	pending	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.23	2025-12-15 10:48:59.23	Parvin Talukdar	+880 017 25940323
3345c477-b81d-4daa-87ed-5513e150e3e1	ORD-2024-0098	1a2afc62-4e5b-40c4-be4f-9594bcd76ee8	\N	addr-1a2afc62-4e5b-40c4-be4f-9594bcd76ee8	12998	0	0	12998	\N	processing	sslcommerz	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.232	2025-12-15 10:48:59.232	Farhan Miah	+880 019 40933392
3a498589-cbd8-4c45-946c-f4eeb28f462e	ORD-2024-0099	1f989822-2116-43c4-bbd8-3a808ef70271	\N	addr-1f989822-2116-43c4-bbd8-3a808ef70271	11997	0	0	11997	\N	shipped	cod	pending	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.234	2025-12-15 10:48:59.234	Khatun Sen	+880 013 35074423
b698460e-aed2-4fd2-95a5-d21f5b55b169	ORD-2024-0100	2199f365-a3d2-44d4-9e64-6358e781f963	\N	addr-2199f365-a3d2-44d4-9e64-6358e781f963	2799	0	0	2799	\N	delivered	sslcommerz	paid	\N	\N	0	0	\N	\N	\N	2025-12-15 10:48:59.236	2025-12-15 10:48:59.236	Rabeya Paul	+880 019 48190828
13bc7bba-6324-4639-9fdc-7e5aca8eac96	CTG1765796080032870	8f1ab731-ef5f-4393-bea0-0ae0f46c03bd	\N	a520f0cb-0b2c-4776-a760-79ca039dc982	4999	130	0	5129	\N	confirmed	cod	paid	\N	\N	0	0	2025-12-15 10:58:30.79	2025-12-15 11:03:28.675	/receipts/receipt-CTG1765796080032870.html	2025-12-15 10:54:40.038	2025-12-15 11:03:28.676	\N	\N
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."OrderItem" (id, "orderId", "productId", "variantInfo", quantity, price, "createdAt") FROM stdin;
19164204-f0ea-45a5-b867-301fc832049b	11a63ed3-8779-4440-98fe-fe62e4fe48a2	06d6a309-54e2-409a-9be1-958dcbed4309	\N	1	1899	2025-12-15 10:48:58.993
2752d01b-aae0-449e-991f-6460b8d9dbc1	e80ac6e2-3cd8-42f9-ba0e-ba93e1e1d915	0f0ee42f-efa3-4077-bf6b-691242b70e67	\N	2	5499	2025-12-15 10:48:59.003
dda8038b-f89c-4414-8247-4d0a150940e9	b492d1e3-3bb4-4652-97ec-2a5e328b0a2b	180433c8-076a-4424-a7ad-b13b5e2670f1	\N	3	4999	2025-12-15 10:48:59.005
4fe557bd-73ee-48c4-870c-1ea3f30e8e17	a55b877a-f03d-4c31-9d4a-721f958f54dc	6b396e36-7f0a-4940-978c-d64358add271	\N	1	4499	2025-12-15 10:48:59.007
53151b6b-20f8-4e2d-8e54-5f8092981681	c6f18032-2a25-4617-8998-894caea98b39	7b2d4d62-4f9e-4181-bdc7-e4e33a74e2f5	\N	2	42999	2025-12-15 10:48:59.01
098aee3e-bb80-4666-a60e-24fe68de968a	94627cce-c190-4f74-9e38-3ebed3ef4ab5	80f03f01-b9bd-49a2-bca2-8fa413a73a0e	\N	3	699	2025-12-15 10:48:59.012
c816a80b-41dd-4688-ab09-83664be7cb8b	e4f69fba-063b-4b21-a58e-33d26aaf6653	933e94a5-c928-48b2-9ff7-fda61e068e35	\N	1	1999	2025-12-15 10:48:59.015
da6d0c38-4428-4e99-aa2b-9d90778792f1	03a64ad9-6c70-4e19-bbf5-19aa4f94d5f2	ac7c1929-aa58-474e-b4f1-e94a076a49a2	\N	2	6499	2025-12-15 10:48:59.017
5ac202f5-17bc-4e80-94c4-7c19ba8e949a	27ac507c-925f-4e44-a8a1-74eca94455a7	cbfa1241-2a21-4ae4-8470-4fd30934d71d	\N	3	3999	2025-12-15 10:48:59.019
53ec674a-1c4c-40d5-961b-0cb22287128d	c83d02d5-b4f1-42f6-a6da-53a3a23ea61d	fd1d57b2-d127-4e29-ba4c-e286b7147fe9	\N	1	2799	2025-12-15 10:48:59.031
aca2685e-1605-4d20-8472-20844104f6ad	1d3444c8-e48b-4444-b7e6-995479c496cf	06d6a309-54e2-409a-9be1-958dcbed4309	\N	2	1899	2025-12-15 10:48:59.033
dd7dd3f9-3f43-40df-9d76-3f99b4e5ca4f	84a8b474-0bfa-4534-989e-fe2dc813605f	0f0ee42f-efa3-4077-bf6b-691242b70e67	\N	3	5499	2025-12-15 10:48:59.035
a666f358-f1d0-42d3-bba4-493e1bb8b194	4dc3c023-d7b4-46d9-8295-3eee7e160511	180433c8-076a-4424-a7ad-b13b5e2670f1	\N	1	4999	2025-12-15 10:48:59.037
d5171daf-b1ed-4a92-86a0-3b7ca7a48032	a82d5859-6d83-4299-8e26-23ad90395868	6b396e36-7f0a-4940-978c-d64358add271	\N	2	4499	2025-12-15 10:48:59.038
d575f100-ef43-4bdc-b22d-1fc60f0ea079	53c1aa31-a707-4839-bf9c-7c260206dadd	7b2d4d62-4f9e-4181-bdc7-e4e33a74e2f5	\N	3	42999	2025-12-15 10:48:59.04
3e336c4b-cf2b-45f0-921a-bf19a222129d	1f030f85-6891-47c1-a633-aa33211dfb7c	80f03f01-b9bd-49a2-bca2-8fa413a73a0e	\N	1	699	2025-12-15 10:48:59.042
8f290780-6770-44c4-9fb4-b34c93988a84	3b0a879e-ce8e-478b-a8ec-16f77d08ae57	933e94a5-c928-48b2-9ff7-fda61e068e35	\N	2	1999	2025-12-15 10:48:59.043
1cd9697e-134c-4e6d-bccb-7692c86c4ccb	185816c1-1aac-4033-8797-78f05cd9d99b	ac7c1929-aa58-474e-b4f1-e94a076a49a2	\N	3	6499	2025-12-15 10:48:59.045
2dc6aef3-62eb-4906-8852-a8c9a4a8252d	c200ff72-0360-407d-a41f-ae758deb2c72	cbfa1241-2a21-4ae4-8470-4fd30934d71d	\N	1	3999	2025-12-15 10:48:59.047
96678c28-dadb-4bea-85d0-12f1a68283bd	f79bdbf6-676d-40dc-a710-62bdf1fea093	fd1d57b2-d127-4e29-ba4c-e286b7147fe9	\N	2	2799	2025-12-15 10:48:59.049
31903aef-4d5b-4c5a-b014-2751cab528e5	51ecb098-67a6-4e7b-b278-6bc0a7667d12	06d6a309-54e2-409a-9be1-958dcbed4309	\N	3	1899	2025-12-15 10:48:59.051
c4be4208-1d6a-4d30-b69a-4b0cfd6ede72	689594ee-6f02-44c7-84b2-daf47013e445	0f0ee42f-efa3-4077-bf6b-691242b70e67	\N	1	5499	2025-12-15 10:48:59.054
d2ddb909-6cf2-4ef0-81a2-1aaa2fe3b60d	53ade360-6bda-498f-8cc8-4f77a5f49ca0	180433c8-076a-4424-a7ad-b13b5e2670f1	\N	2	4999	2025-12-15 10:48:59.056
727755a1-63da-4369-96b7-39b2d1beb386	b9f62599-0b78-4014-9a89-0eff88c43092	6b396e36-7f0a-4940-978c-d64358add271	\N	3	4499	2025-12-15 10:48:59.057
a627537e-5e23-411d-8fd0-acdd7bd4e5d1	0b6f0f6f-07bb-4fa9-be78-7a0a92153efb	7b2d4d62-4f9e-4181-bdc7-e4e33a74e2f5	\N	1	42999	2025-12-15 10:48:59.059
ad17493e-2665-45c9-bcc7-d055547d1a7d	f8fa1c6a-4f72-4e99-91cc-af577b834f63	80f03f01-b9bd-49a2-bca2-8fa413a73a0e	\N	2	699	2025-12-15 10:48:59.06
df32fde4-9421-437f-aabc-82ae15e7a0e6	13360b57-0835-4e45-9500-bb9f281bf697	933e94a5-c928-48b2-9ff7-fda61e068e35	\N	3	1999	2025-12-15 10:48:59.062
4c5de831-4f25-4acc-9320-57d578753880	a13164c0-79d1-4218-af9e-b44d90f915d7	ac7c1929-aa58-474e-b4f1-e94a076a49a2	\N	1	6499	2025-12-15 10:48:59.063
ac531fad-c244-4af6-bafa-5419aadf7f40	f34b4dfb-8eab-425a-b43d-b26c2ef2f076	cbfa1241-2a21-4ae4-8470-4fd30934d71d	\N	2	3999	2025-12-15 10:48:59.065
3cf12a54-61ba-47be-8bf8-0dfe5e754008	0154d750-ebab-43de-a8c5-e46b0b862bd3	fd1d57b2-d127-4e29-ba4c-e286b7147fe9	\N	3	2799	2025-12-15 10:48:59.067
00e72590-8cc0-4fb7-99e5-0df1f5fc04bf	b08be92f-28c8-4b3a-acc0-f73100c4a748	06d6a309-54e2-409a-9be1-958dcbed4309	\N	1	1899	2025-12-15 10:48:59.069
7922e89b-e9eb-4ca4-ad13-a0b523eb95ad	e4a6fcdb-999c-4985-813d-329cb0563681	0f0ee42f-efa3-4077-bf6b-691242b70e67	\N	2	5499	2025-12-15 10:48:59.071
9c46db36-c58a-419f-8f7c-682dc3c09860	f44ed862-cb2c-45b3-8972-c50b7e17ea73	180433c8-076a-4424-a7ad-b13b5e2670f1	\N	3	4999	2025-12-15 10:48:59.083
87a42b94-c2b1-4731-a2dc-0136594d699b	a2872045-793e-46d7-ad53-ef642b31095b	6b396e36-7f0a-4940-978c-d64358add271	\N	1	4499	2025-12-15 10:48:59.085
ca2f6542-b7b1-4e64-bfa5-41722f2b6c50	7a095bf9-ccda-46e5-9602-1a6518aafcce	7b2d4d62-4f9e-4181-bdc7-e4e33a74e2f5	\N	2	42999	2025-12-15 10:48:59.087
8519823d-653b-4fd1-ab45-c25873e9836a	7a3d6f70-c45d-4319-8025-d8952b128561	80f03f01-b9bd-49a2-bca2-8fa413a73a0e	\N	3	699	2025-12-15 10:48:59.089
a7801e57-7a09-44bb-87fc-64d42e92b579	636edcf8-06ab-4e6f-8a24-9480fea5a5ad	933e94a5-c928-48b2-9ff7-fda61e068e35	\N	1	1999	2025-12-15 10:48:59.091
a7848cf5-5083-476f-a4c2-41a2d68b9bc2	8ee56ea6-b22e-4c73-9be3-77adde5ee457	ac7c1929-aa58-474e-b4f1-e94a076a49a2	\N	2	6499	2025-12-15 10:48:59.093
7cbfdb05-0e46-49c4-9527-ee7656d14705	182e1408-a650-4f4d-9e17-6898f38c82e1	cbfa1241-2a21-4ae4-8470-4fd30934d71d	\N	3	3999	2025-12-15 10:48:59.094
660b2ce5-df6f-4bbf-bcb5-cf28e66da830	f11d61ad-b387-49d7-ba5c-33566aeca240	fd1d57b2-d127-4e29-ba4c-e286b7147fe9	\N	1	2799	2025-12-15 10:48:59.096
ad36cf97-c358-47d7-bfee-a0a4a4184803	2bd9f4e1-21c3-4ede-a4c4-25fe3c62d5bc	06d6a309-54e2-409a-9be1-958dcbed4309	\N	2	1899	2025-12-15 10:48:59.098
dc0edaf4-b772-4f43-8dd3-9e37f92d6b87	a74f0988-b5d8-4d81-9701-15e3ac4e07b7	0f0ee42f-efa3-4077-bf6b-691242b70e67	\N	3	5499	2025-12-15 10:48:59.099
777a202f-fc20-45dc-9b01-7c0b9b9eaedd	c29f50e8-de8c-42da-a0ef-f042ccbb2fe8	180433c8-076a-4424-a7ad-b13b5e2670f1	\N	1	4999	2025-12-15 10:48:59.101
28be9ed5-b0fb-435b-b5dc-c8d626fea455	4f597d01-95ef-49c9-889f-772ffb72595a	6b396e36-7f0a-4940-978c-d64358add271	\N	2	4499	2025-12-15 10:48:59.103
6bc21689-5413-443f-a36b-66eba08c7685	9fce8509-6a94-439c-b926-802d0f9fa0e9	7b2d4d62-4f9e-4181-bdc7-e4e33a74e2f5	\N	3	42999	2025-12-15 10:48:59.105
93b5613e-1e80-4390-a85f-473790e18c2d	4751de12-f631-4d90-84f4-712021959757	80f03f01-b9bd-49a2-bca2-8fa413a73a0e	\N	1	699	2025-12-15 10:48:59.107
6f50d2a8-b49a-4b40-91d4-b07788123549	366e1719-9268-4b27-b813-bab612157bee	933e94a5-c928-48b2-9ff7-fda61e068e35	\N	2	1999	2025-12-15 10:48:59.109
32017509-5cdd-42ac-b215-4fdb51b84f48	e7f29a26-e350-4fe1-b981-ece0c743108b	ac7c1929-aa58-474e-b4f1-e94a076a49a2	\N	3	6499	2025-12-15 10:48:59.11
aa28ffe0-8075-4362-be3d-78bff20bf2b4	f7d55a2e-5078-4420-8f33-68e848b0ce45	cbfa1241-2a21-4ae4-8470-4fd30934d71d	\N	1	3999	2025-12-15 10:48:59.112
2aad4f1b-9518-4c7f-b958-b153835a9b45	f897eb3e-202c-491c-bbff-0917674d80ce	fd1d57b2-d127-4e29-ba4c-e286b7147fe9	\N	2	2799	2025-12-15 10:48:59.114
b9f1280a-e9ef-4957-96ea-95f1ca795ee0	04e75d54-a013-4f6a-a7ac-43e5da9b3ecb	06d6a309-54e2-409a-9be1-958dcbed4309	\N	3	1899	2025-12-15 10:48:59.115
8801ebb1-a486-4132-9a8b-af853f4454e1	6c520993-13d0-4c51-adf6-ad3df0869a07	0f0ee42f-efa3-4077-bf6b-691242b70e67	\N	1	5499	2025-12-15 10:48:59.131
b56cea95-ef7e-4ee5-8606-34b369a1e832	e05d3e08-4105-4f9c-b026-bb2d3fc38566	180433c8-076a-4424-a7ad-b13b5e2670f1	\N	2	4999	2025-12-15 10:48:59.134
93282112-4b06-4f42-a9d2-26532f39accd	d1ca76f2-ce49-4563-959e-3c8559df55b1	6b396e36-7f0a-4940-978c-d64358add271	\N	3	4499	2025-12-15 10:48:59.136
8e451a07-3a76-48d2-8ef6-c94b5453acaa	a35cf105-0228-40e9-a2a2-7c4d7a0011ff	7b2d4d62-4f9e-4181-bdc7-e4e33a74e2f5	\N	1	42999	2025-12-15 10:48:59.138
e9dfa0ee-df47-44d1-b37e-3c9a1411d65d	f4102efe-058c-45eb-8ffc-041e975481f8	80f03f01-b9bd-49a2-bca2-8fa413a73a0e	\N	2	699	2025-12-15 10:48:59.14
df99ba4f-bd85-4c58-9930-adedd6d03368	93d0b9da-dc63-49eb-b330-4dae5edb853d	933e94a5-c928-48b2-9ff7-fda61e068e35	\N	3	1999	2025-12-15 10:48:59.142
6425036b-8e06-47a5-aaef-74ef269d266d	79ab094a-28d9-43a2-86c2-ae0bbe58cbaa	ac7c1929-aa58-474e-b4f1-e94a076a49a2	\N	1	6499	2025-12-15 10:48:59.144
a083ffd9-8ae2-4020-bd22-10d211b43dbe	0141ffb9-6846-4893-ba93-0297c8185e75	cbfa1241-2a21-4ae4-8470-4fd30934d71d	\N	2	3999	2025-12-15 10:48:59.146
73fa023a-98d5-4f61-b6b6-7061c489ffc3	62321658-7b35-43d0-a446-ee54eb6ab0a0	fd1d57b2-d127-4e29-ba4c-e286b7147fe9	\N	3	2799	2025-12-15 10:48:59.147
71ea0319-abf9-47d1-ab80-ed85c0117588	95cf8b2d-0283-4fee-90fa-a450ddd38f0e	06d6a309-54e2-409a-9be1-958dcbed4309	\N	1	1899	2025-12-15 10:48:59.149
5f045505-0172-4186-9803-a18880505dcd	8a454259-da89-4dab-983b-54b354da56f5	0f0ee42f-efa3-4077-bf6b-691242b70e67	\N	2	5499	2025-12-15 10:48:59.161
ffdd0072-a5bd-4130-bb62-c6c13a1642ba	73164297-7601-4a98-b355-d5f3015aff5b	180433c8-076a-4424-a7ad-b13b5e2670f1	\N	3	4999	2025-12-15 10:48:59.164
c7719432-e102-4506-865e-d1ba94c05964	e939ba45-25b6-4da8-b020-292b85209aa5	6b396e36-7f0a-4940-978c-d64358add271	\N	1	4499	2025-12-15 10:48:59.166
6216e728-c27e-4250-88ba-7e71867443d4	49a4b4b0-779e-4d55-b072-5de3ab8462c9	7b2d4d62-4f9e-4181-bdc7-e4e33a74e2f5	\N	2	42999	2025-12-15 10:48:59.167
b279935a-68ce-4fba-a14b-4a57c4a85205	5fcf7c06-51cf-4f14-816b-8aa0639952f8	80f03f01-b9bd-49a2-bca2-8fa413a73a0e	\N	3	699	2025-12-15 10:48:59.169
67958959-7bbf-46e3-9111-46b30cb0049d	b9fa4098-f074-4b4f-9441-d98ec7ae04fa	933e94a5-c928-48b2-9ff7-fda61e068e35	\N	1	1999	2025-12-15 10:48:59.17
806584a0-abfe-48b7-801d-88612be9e582	fb6cb73a-bfd2-462f-aa6a-539f682cfd99	ac7c1929-aa58-474e-b4f1-e94a076a49a2	\N	2	6499	2025-12-15 10:48:59.172
8a66cebf-5cb5-4a61-9e11-eecb30604c41	cd5ec55c-f84c-4346-b019-01146c439d6a	cbfa1241-2a21-4ae4-8470-4fd30934d71d	\N	3	3999	2025-12-15 10:48:59.173
9444fe3f-8045-4e0d-a15e-5d30a650cabf	beaf7269-0fb9-48dd-bded-001b9a2d4230	fd1d57b2-d127-4e29-ba4c-e286b7147fe9	\N	1	2799	2025-12-15 10:48:59.174
0bb254d9-64d2-40e5-a073-c105fef5de7a	5561c833-b4ff-4a60-8f0d-ce9ee1abaf5f	06d6a309-54e2-409a-9be1-958dcbed4309	\N	2	1899	2025-12-15 10:48:59.176
888d7760-0ca0-4819-aced-752f6974d87f	2ae503f5-a3ea-4f52-9218-b8f9c6ce70fc	0f0ee42f-efa3-4077-bf6b-691242b70e67	\N	3	5499	2025-12-15 10:48:59.178
efc9edf9-7dd8-4eaa-99f3-c248cb29793e	98c7ea84-e0db-42c2-8318-5c8f8238e5f4	180433c8-076a-4424-a7ad-b13b5e2670f1	\N	1	4999	2025-12-15 10:48:59.179
226de207-52d6-4c3e-b436-de0f27081e7e	9a59164f-d0d4-4ea9-b7e7-c03af5608cf1	6b396e36-7f0a-4940-978c-d64358add271	\N	2	4499	2025-12-15 10:48:59.181
3d6c26b1-02e5-427a-b6b4-2509240f04a8	47ca22bd-d835-44dd-825b-6deb4e9e155d	7b2d4d62-4f9e-4181-bdc7-e4e33a74e2f5	\N	3	42999	2025-12-15 10:48:59.183
426e554f-4edb-41b1-a14c-0e8aa644d67b	5c096719-06ce-4bc2-b070-aed4a4e788d9	80f03f01-b9bd-49a2-bca2-8fa413a73a0e	\N	1	699	2025-12-15 10:48:59.185
0ea5e210-f754-49cb-8ca1-200fcf7b7874	8038c70d-aa40-42fc-b5b2-26c9c6c9958e	933e94a5-c928-48b2-9ff7-fda61e068e35	\N	2	1999	2025-12-15 10:48:59.186
2e4ee910-6bba-4572-966b-1ee1ac59d5c1	ccc9b30c-3a57-470a-b88f-20c091beb329	ac7c1929-aa58-474e-b4f1-e94a076a49a2	\N	3	6499	2025-12-15 10:48:59.188
dbba7385-8e23-45f6-8732-42d345c37166	66abde23-ff2a-457d-8879-a54dd14d64b2	cbfa1241-2a21-4ae4-8470-4fd30934d71d	\N	1	3999	2025-12-15 10:48:59.189
2df28b15-2b46-4ed3-a0fd-691c6e6fc7f1	aa6c35ae-10c8-4890-b579-d76d7061edf6	fd1d57b2-d127-4e29-ba4c-e286b7147fe9	\N	2	2799	2025-12-15 10:48:59.191
6aee5347-84e3-477c-af77-daf45652b220	e9a6e35e-f68f-4ecf-8473-a162c31eae45	06d6a309-54e2-409a-9be1-958dcbed4309	\N	3	1899	2025-12-15 10:48:59.193
1d55a71a-9b9a-41e4-9e17-d8a0d06dd9b6	13ab2b08-747a-46f4-97be-b083b95f8f51	0f0ee42f-efa3-4077-bf6b-691242b70e67	\N	1	5499	2025-12-15 10:48:59.196
52f4ecb8-8827-40af-971c-4ff4a6106ccb	085b819e-27ae-49c2-a71a-bc7ef8b31226	180433c8-076a-4424-a7ad-b13b5e2670f1	\N	2	4999	2025-12-15 10:48:59.197
9cb9ecda-0ee5-48f4-95d8-04ff3470ee8d	68dbf4ee-9ea8-451b-a83b-a0ce134fbfc0	6b396e36-7f0a-4940-978c-d64358add271	\N	3	4499	2025-12-15 10:48:59.199
9f58c502-466a-483d-897b-934ce14b8a8d	dde6fb08-4506-4bec-8650-65e78e003cc2	7b2d4d62-4f9e-4181-bdc7-e4e33a74e2f5	\N	1	42999	2025-12-15 10:48:59.2
563c6b64-3a78-4a3d-8aa5-965d8f4d1d68	8f92dd78-9377-45e3-a294-59588eae6116	80f03f01-b9bd-49a2-bca2-8fa413a73a0e	\N	2	699	2025-12-15 10:48:59.202
55f083fe-d472-4610-8ec9-5fa7e4c2bc42	ffb41717-be4e-4b52-878c-1de6a4fe9eb6	933e94a5-c928-48b2-9ff7-fda61e068e35	\N	3	1999	2025-12-15 10:48:59.203
8b15ab4c-776f-412d-a30b-9dd508cb9be7	586e8621-f9f2-4cbf-bd3b-f5051c64274f	ac7c1929-aa58-474e-b4f1-e94a076a49a2	\N	1	6499	2025-12-15 10:48:59.205
ac151010-19f6-4fd8-af5d-acc29f39ec69	137c661d-ec5d-404f-8019-faee7208f6d1	cbfa1241-2a21-4ae4-8470-4fd30934d71d	\N	2	3999	2025-12-15 10:48:59.215
08470670-292d-45d7-82ef-90f8504916c7	f0575d06-33d6-49a6-a8be-8b96c2ebbfb4	fd1d57b2-d127-4e29-ba4c-e286b7147fe9	\N	3	2799	2025-12-15 10:48:59.217
e0f69d02-792a-45f8-9d2a-50a12ff48477	f1e604c8-dbe1-421d-a2ba-634c290ec354	06d6a309-54e2-409a-9be1-958dcbed4309	\N	1	1899	2025-12-15 10:48:59.219
4bb4f62f-e156-42ce-9df0-3bbb807c3ec5	74c85e74-55f3-4514-8705-d50f1b371eef	0f0ee42f-efa3-4077-bf6b-691242b70e67	\N	2	5499	2025-12-15 10:48:59.221
92db5c77-31d0-4581-bcb9-d273251e92d4	cc60aa10-1bb1-4b79-a40a-a5dda2e45dfb	180433c8-076a-4424-a7ad-b13b5e2670f1	\N	3	4999	2025-12-15 10:48:59.223
5effc2bd-9309-462f-8fc4-81460b45756d	d720612e-afe5-47dc-9a1b-9745330ae503	6b396e36-7f0a-4940-978c-d64358add271	\N	1	4499	2025-12-15 10:48:59.224
062953a1-421e-40df-a327-5418c10f80ee	363b3581-4598-4050-84c0-b5c47b1a11f4	7b2d4d62-4f9e-4181-bdc7-e4e33a74e2f5	\N	2	42999	2025-12-15 10:48:59.226
ab299c4c-e23f-4561-82fd-fd5aeb8c5b6f	919617b3-4ae6-4518-b760-00663412eba9	80f03f01-b9bd-49a2-bca2-8fa413a73a0e	\N	3	699	2025-12-15 10:48:59.228
72ca518c-70e8-4039-a477-dc38388f1e68	ae977e60-4b80-41b2-8acc-ff69f64f3d1a	933e94a5-c928-48b2-9ff7-fda61e068e35	\N	1	1999	2025-12-15 10:48:59.23
2ea953ff-86fc-4062-81f6-42875b592fe5	3345c477-b81d-4daa-87ed-5513e150e3e1	ac7c1929-aa58-474e-b4f1-e94a076a49a2	\N	2	6499	2025-12-15 10:48:59.232
8baaf6f9-566a-4d31-9ab6-932225f3424e	3a498589-cbd8-4c45-946c-f4eeb28f462e	cbfa1241-2a21-4ae4-8470-4fd30934d71d	\N	3	3999	2025-12-15 10:48:59.234
c88f0491-b562-4e66-a2bd-f2e69333e812	b698460e-aed2-4fd2-95a5-d21f5b55b169	fd1d57b2-d127-4e29-ba4c-e286b7147fe9	\N	1	2799	2025-12-15 10:48:59.236
37ff8b75-b79b-4031-840e-8d0163308491	13bc7bba-6324-4639-9fdc-7e5aca8eac96	180433c8-076a-4424-a7ad-b13b5e2670f1	{"size":"50ml","color":"Clear","variantId":"07a928a8-a111-4be7-b5bf-d04af20d4226"}	1	4999	2025-12-15 10:54:40.038
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Payment" (id, "orderId", "transactionId", method, amount, status, "gatewayResponse", "createdAt", "updatedAt") FROM stdin;
9fc565c2-b192-4dbc-ac32-d38c7a9abd66	13bc7bba-6324-4639-9fdc-7e5aca8eac96	\N	cod	5129	pending	\N	2025-12-15 10:54:40.047	2025-12-15 10:54:40.047
\.


--
-- Data for Name: PointsTransaction; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PointsTransaction" (id, "userId", points, type, "orderId", description, "createdAt", "expiresAt", "loyaltyId") FROM stdin;
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Product" (id, name, slug, description, "categoryId", "basePrice", "salePrice", images, "isFeatured", "isBestseller", "isActive", "sizeGuide", "hasWarranty", "warrantyPeriod", "createdAt", "updatedAt") FROM stdin;
80f03f01-b9bd-49a2-bca2-8fa413a73a0e	Premium Cotton T-Shirt	premium-cotton-tshirt	Comfortable and stylish cotton t-shirt perfect for everyday wear. Made from 100% premium cotton with excellent breathability.	83bc6972-ff69-4db3-8dea-3addc8c72396	899	699	["/images/products/tshirt.png"]	t	t	t	\N	f	\N	2025-12-15 05:14:01.032	2025-12-15 05:15:21.269
933e94a5-c928-48b2-9ff7-fda61e068e35	Floral Summer Dress	floral-summer-dress	Elegant floral dress perfect for summer outings. Lightweight and breathable fabric with beautiful floral patterns.	83bc6972-ff69-4db3-8dea-3addc8c72396	2499	1999	["/images/products/dress.png"]	t	f	t	\N	f	\N	2025-12-15 05:14:01.041	2025-12-15 05:15:21.273
fd1d57b2-d127-4e29-ba4c-e286b7147fe9	Classic White Sneakers	classic-white-sneakers	Versatile white sneakers with blue accents. Comfortable cushioning and durable construction for all-day wear.	83bc6972-ff69-4db3-8dea-3addc8c72396	3499	2799	["/images/products/sneakers.png"]	f	t	t	\N	f	\N	2025-12-15 05:14:01.043	2025-12-15 05:15:21.275
cbfa1241-2a21-4ae4-8470-4fd30934d71d	Leather Backpack	leather-backpack	Premium black leather backpack with multiple compartments. Perfect for work, travel, or daily use.	83bc6972-ff69-4db3-8dea-3addc8c72396	4999	3999	["/images/products/backpack.png"]	t	f	t	\N	f	\N	2025-12-15 05:14:01.044	2025-12-15 05:15:21.277
6b396e36-7f0a-4940-978c-d64358add271	Wireless Bluetooth Headphones	wireless-bluetooth-headphones	Premium wireless headphones with active noise cancellation. 40-hour battery life and superior sound quality.	91469a18-dfad-491b-a662-90c265f6edcc	5999	4499	["/images/products/headphones.png"]	t	t	t	\N	f	\N	2025-12-15 05:14:01.046	2025-12-15 05:15:21.279
7b2d4d62-4f9e-4181-bdc7-e4e33a74e2f5	Smartphone Pro X	smartphone-pro-x	Latest flagship smartphone with 6.5" AMOLED display, 128GB storage, and advanced camera system.	91469a18-dfad-491b-a662-90c265f6edcc	45999	42999	["/images/products/smartphone.png"]	t	f	t	\N	f	\N	2025-12-15 05:14:01.047	2025-12-15 05:15:21.28
0f0ee42f-efa3-4077-bf6b-691242b70e67	Stainless Steel Coffee Maker	stainless-steel-coffee-maker	Modern coffee maker with programmable settings. Makes perfect coffee every time with 12-cup capacity.	a7356123-d620-444f-8645-1082ced4487a	6499	5499	["/images/products/coffee.png"]	f	t	t	\N	f	\N	2025-12-15 05:14:01.048	2025-12-15 05:15:21.281
06d6a309-54e2-409a-9be1-958dcbed4309	Modern Desk Lamp	modern-desk-lamp	Minimalist desk lamp with adjustable brightness. Energy-efficient LED with touch controls.	a7356123-d620-444f-8645-1082ced4487a	2499	1899	["/images/products/lamp.png"]	t	f	t	\N	f	\N	2025-12-15 05:14:01.05	2025-12-15 05:15:21.282
ac7c1929-aa58-474e-b4f1-e94a076a49a2	Luxury Skincare Set	luxury-skincare-set	Complete skincare routine with cleanser, toner, serum, and moisturizer. Premium ingredients for radiant skin.	4410af1e-33eb-4e99-a3ce-b60a949f6db0	7999	6499	["/images/products/skincare.png"]	t	t	t	\N	f	\N	2025-12-15 05:14:01.052	2025-12-15 05:15:21.283
180433c8-076a-4424-a7ad-b13b5e2670f1	Eau de Parfum	eau-de-parfum	Elegant fragrance with floral and woody notes. Long-lasting scent in a beautiful crystal bottle.	4410af1e-33eb-4e99-a3ce-b60a949f6db0	5999	4999	["/images/products/perfume.png"]	t	f	t	\N	f	\N	2025-12-15 05:14:01.054	2025-12-15 05:15:21.284
\.


--
-- Data for Name: ProductAnswer; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ProductAnswer" (id, "questionId", "userId", answer, "isOfficial", "isVisible", upvotes, "createdAt") FROM stdin;
\.


--
-- Data for Name: ProductComparison; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ProductComparison" (id, "sessionId", "userId", "productIds", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ProductQuestion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ProductQuestion" (id, "productId", "userId", question, "isAnswered", "isVisible", "createdAt") FROM stdin;
\.


--
-- Data for Name: ProductVariant; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ProductVariant" (id, "productId", sku, size, color, stock, "createdAt", "updatedAt") FROM stdin;
162ac706-42fa-4def-a701-01359b1e50a3	933e94a5-c928-48b2-9ff7-fda61e068e35	DRS-FLR-M	M	Floral	40	2025-12-15 05:14:01.041	2025-12-15 05:14:01.041
65a2f485-63d7-43fa-b090-488c5ac3efc2	80f03f01-b9bd-49a2-bca2-8fa413a73a0e	TSH-NVY-S	S	Navy	50	2025-12-15 05:14:01.032	2025-12-15 05:14:01.032
0abddae5-4360-4218-9af4-4166b97143ca	80f03f01-b9bd-49a2-bca2-8fa413a73a0e	TSH-NVY-M	M	Navy	75	2025-12-15 05:14:01.032	2025-12-15 05:14:01.032
5565a6a2-0960-478f-8731-856ce4401c2d	80f03f01-b9bd-49a2-bca2-8fa413a73a0e	TSH-NVY-L	L	Navy	60	2025-12-15 05:14:01.032	2025-12-15 05:14:01.032
913acc90-a4bd-4e9b-be7c-0c11b3292f2b	80f03f01-b9bd-49a2-bca2-8fa413a73a0e	TSH-NVY-XL	XL	Navy	40	2025-12-15 05:14:01.032	2025-12-15 05:14:01.032
84e7eb8b-8be2-4e44-b91c-b2061c162fc2	933e94a5-c928-48b2-9ff7-fda61e068e35	DRS-FLR-S	S	Floral	30	2025-12-15 05:14:01.041	2025-12-15 05:14:01.041
7a4b5c08-d703-4ab6-8e9b-4a0d5b195ddf	933e94a5-c928-48b2-9ff7-fda61e068e35	DRS-FLR-L	L	Floral	35	2025-12-15 05:14:01.041	2025-12-15 05:14:01.041
126f4861-0fab-4115-b4d3-ca922b683ce6	fd1d57b2-d127-4e29-ba4c-e286b7147fe9	SNK-WHT-39	39	White/Blue	25	2025-12-15 05:14:01.043	2025-12-15 05:14:01.043
faf33b2f-eb97-4cb9-bf33-5c526c340aca	fd1d57b2-d127-4e29-ba4c-e286b7147fe9	SNK-WHT-40	40	White/Blue	30	2025-12-15 05:14:01.043	2025-12-15 05:14:01.043
550cbe7c-0b93-4abe-aad9-f25bb4f2a993	fd1d57b2-d127-4e29-ba4c-e286b7147fe9	SNK-WHT-41	41	White/Blue	35	2025-12-15 05:14:01.043	2025-12-15 05:14:01.043
ee88c7fe-1f1a-4872-b50d-b5395a4375df	fd1d57b2-d127-4e29-ba4c-e286b7147fe9	SNK-WHT-42	42	White/Blue	30	2025-12-15 05:14:01.043	2025-12-15 05:14:01.043
a96c99cf-c738-4db2-86cc-ba5d53a5f8e3	fd1d57b2-d127-4e29-ba4c-e286b7147fe9	SNK-WHT-43	43	White/Blue	20	2025-12-15 05:14:01.043	2025-12-15 05:14:01.043
685627e4-54e3-4384-b122-fc7cf7db68b9	cbfa1241-2a21-4ae4-8470-4fd30934d71d	BAG-BLK-STD	Standard	Black	45	2025-12-15 05:14:01.044	2025-12-15 05:14:01.044
1040a261-b8b1-4406-af6c-5a82abfd868f	6b396e36-7f0a-4940-978c-d64358add271	HP-BLK-STD	Standard	Black	60	2025-12-15 05:14:01.046	2025-12-15 05:14:01.046
56fa1f30-c444-4ed4-a008-ee9379c93fba	7b2d4d62-4f9e-4181-bdc7-e4e33a74e2f5	PHN-BLK-128	128GB	Black	20	2025-12-15 05:14:01.047	2025-12-15 05:14:01.047
42f3f870-9efb-495d-b72a-fe1e6e432596	7b2d4d62-4f9e-4181-bdc7-e4e33a74e2f5	PHN-BLU-128	128GB	Blue	15	2025-12-15 05:14:01.047	2025-12-15 05:14:01.047
e3c6c1d6-19b3-4829-b24a-86ade29be8d8	0f0ee42f-efa3-4077-bf6b-691242b70e67	COF-SS-12	12-Cup	Stainless Steel	35	2025-12-15 05:14:01.048	2025-12-15 05:14:01.048
e5e7979e-df55-4b3f-accc-2f9b10005e2b	06d6a309-54e2-409a-9be1-958dcbed4309	LMP-BLK-STD	Standard	Black	50	2025-12-15 05:14:01.05	2025-12-15 05:14:01.05
117ebe13-2a47-402d-a20e-5b1b9904efda	06d6a309-54e2-409a-9be1-958dcbed4309	LMP-WHT-STD	Standard	White	45	2025-12-15 05:14:01.05	2025-12-15 05:14:01.05
6982b125-504e-42ea-9748-46d0aee96f0d	ac7c1929-aa58-474e-b4f1-e94a076a49a2	SKN-LUX-SET	Full Set	Gold	40	2025-12-15 05:14:01.052	2025-12-15 05:14:01.052
a1eca633-0452-4347-85d9-fea981fb3acc	180433c8-076a-4424-a7ad-b13b5e2670f1	PRF-EDP-100	100ml	Clear	30	2025-12-15 05:14:01.054	2025-12-15 05:14:01.054
07a928a8-a111-4be7-b5bf-d04af20d4226	180433c8-076a-4424-a7ad-b13b5e2670f1	PRF-EDP-50	50ml	Clear	54	2025-12-15 05:14:01.054	2025-12-15 10:54:40.046
\.


--
-- Data for Name: Referral; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Referral" (id, "referrerId", status, "createdAt", "completedAt", "referralCode", "referredBonus", "referredId", "referrerBonus", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Review" (id, "productId", "userId", rating, comment, "isApproved", "createdAt", "updatedAt") FROM stdin;
d166d79a-8475-44f3-8786-52cbefb4dcdd	180433c8-076a-4424-a7ad-b13b5e2670f1	e7b32f40-f512-4444-babd-135015b1b162	5	Absolutely love this fragrance! Long-lasting and the scent is very elegant. Perfect for special occasions.	t	2025-11-25 05:14:01.056	2025-12-15 05:14:01.06
bd9e6131-0edb-4037-9551-8fcd764c4e8b	180433c8-076a-4424-a7ad-b13b5e2670f1	dd6d0b71-d5ee-4fa9-8edc-d0cd1229bbf9	5	My favorite perfume now! The floral notes are beautiful and it stays all day. Great packaging too!	t	2025-12-03 05:14:01.059	2025-12-15 05:14:01.064
b6f08b80-5c6d-4a5c-a97e-86f2b9ae796e	180433c8-076a-4424-a7ad-b13b5e2670f1	9e0d68eb-3cc1-4a77-87c3-42831cf83eed	4	Very nice perfume. Bought it as a gift for my wife and she loved it. The price is reasonable for the quality.	t	2025-12-07 05:14:01.061	2025-12-15 05:14:01.065
9a722d67-709f-45e9-952e-6a72457d260f	933e94a5-c928-48b2-9ff7-fda61e068e35	dd6d0b71-d5ee-4fa9-8edc-d0cd1229bbf9	5	Beautiful dress! The fabric is very comfortable and the print is exactly as shown. Perfect fit!	t	2025-11-27 05:14:01.062	2025-12-15 05:14:01.067
7665435a-e8f2-428e-b882-ab2f277509a8	933e94a5-c928-48b2-9ff7-fda61e068e35	ae2ab1a9-5537-48e3-9041-5b20631113b0	4	Nice summer dress. The color is vibrant and material is breathable. Took a bit longer to deliver but worth the wait!	t	2025-12-01 05:14:01.063	2025-12-15 05:14:01.067
3e95cc7d-f9c6-4bd5-90f4-95fea0b76c38	933e94a5-c928-48b2-9ff7-fda61e068e35	e7b32f40-f512-4444-babd-135015b1b162	5	Excellent quality dress! Very comfortable for hot weather. Received many compliments when I wore it!	t	2025-12-10 05:14:01.064	2025-12-15 05:14:01.068
9ba186aa-c021-424d-9222-34e99e38d43c	933e94a5-c928-48b2-9ff7-fda61e068e35	05a7621a-5570-4452-acb4-1b00c782584c	3	Good dress but the size runs a bit small. Material quality is nice though. Would recommend sizing up.	t	2025-12-13 05:14:01.064	2025-12-15 05:14:01.068
\.


--
-- Data for Name: SiteSettings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SiteSettings" (id, "chatStatus", "promoEnabled", "promoCode", "promoMessage", "promoEndTime", "storeName", "storeEmail", "storePhone", "storeAddress", "shippingCost", "freeShippingMin", "codEnabled", "sslEnabled", "pointsPerTaka", "pointsValue", "updatedAt") FROM stdin;
default	online	f	WELCOME10	🎉 FLASH SALE! Use code WELCOME10 for 10% OFF	\N	CTG Collection	info@ctgcollection.com	+880 1234 567890	Chittagong, Bangladesh	60	2000	t	t	0.01	0.1	2025-12-15 05:34:44.294
\.


--
-- Data for Name: Testimonial; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Testimonial" (id, "userId", name, email, avatar, content, rating, location, "isApproved", "isFeatured", "createdAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, email, password, name, phone, role, "isActive", "createdById", "googleId", "referralCode", "createdAt", "updatedAt", "emailVerified", "twoFactorEnabled", "twoFactorMethod", "verificationExpiry", "verificationToken") FROM stdin;
cb58e1a1-c3ee-455a-b8d7-cca6e03bf81b	sanim1728@gmail.com	$2b$10$Z/TQvsw2XVsbbaUD0WZXu.S5NfdDA7EIW7enWo04KvvqIpX2N8c7W	Super Admin	+8801700000000	superadmin	t	\N	\N	\N	2025-12-15 05:14:00.859	2025-12-15 05:14:00.859	f	f	\N	\N	\N
6cdbbe46-2b9a-4755-b8d9-4d9a5b5469d9	admin@ctgcollection.com	$2b$10$b39nSp.y1AnbV0qiMujzf.gdMsRHTcZHbHQHb8HJ5xiTdZBoMgDwa	Admin User	+8801712345678	admin	t	\N	\N	\N	2025-12-15 05:14:00.919	2025-12-15 05:14:00.919	f	f	\N	\N	\N
05a7621a-5570-4452-acb4-1b00c782584c	customer@example.com	$2b$10$nCULdU.RkwOsMfn5g5Z13O1ZTjjtOZjsSznG2L6XQIVB2BhRXfGTS	John Doe	+8801812345678	customer	t	\N	\N	\N	2025-12-15 05:14:00.974	2025-12-15 05:14:00.974	f	f	\N	\N	\N
ae2ab1a9-5537-48e3-9041-5b20631113b0	fahim.rahman@email.com	$2b$10$nCULdU.RkwOsMfn5g5Z13O1ZTjjtOZjsSznG2L6XQIVB2BhRXfGTS	Fahim Rahman	+8801911223344	customer	t	\N	\N	\N	2025-12-15 05:14:01.056	2025-12-15 05:14:01.056	f	f	\N	\N	\N
e7b32f40-f512-4444-babd-135015b1b162	nasrin.akter@email.com	$2b$10$nCULdU.RkwOsMfn5g5Z13O1ZTjjtOZjsSznG2L6XQIVB2BhRXfGTS	Nasrin Akter	+8801722334455	customer	t	\N	\N	\N	2025-12-15 05:14:01.057	2025-12-15 05:14:01.057	f	f	\N	\N	\N
15126e74-e69c-44fd-b001-184abb3ca6b2	rahim.mia@email.com	$2b$10$nCULdU.RkwOsMfn5g5Z13O1ZTjjtOZjsSznG2L6XQIVB2BhRXfGTS	Rahim Mia	+8801833445566	customer	t	\N	\N	\N	2025-12-15 05:14:01.058	2025-12-15 05:14:01.058	f	f	\N	\N	\N
dd6d0b71-d5ee-4fa9-8edc-d0cd1229bbf9	ayesha.begum@email.com	$2b$10$nCULdU.RkwOsMfn5g5Z13O1ZTjjtOZjsSznG2L6XQIVB2BhRXfGTS	Ayesha Begum	+8801944556677	customer	t	\N	\N	\N	2025-12-15 05:14:01.058	2025-12-15 05:14:01.058	f	f	\N	\N	\N
9e0d68eb-3cc1-4a77-87c3-42831cf83eed	kamal.hossain@email.com	$2b$10$nCULdU.RkwOsMfn5g5Z13O1ZTjjtOZjsSznG2L6XQIVB2BhRXfGTS	Kamal Hossain	+8801655667788	customer	t	\N	\N	\N	2025-12-15 05:14:01.059	2025-12-15 05:14:01.059	f	f	\N	\N	\N
9e167f20-053a-4e11-96ed-4cb1e3273165	nila.miah0@example.com	$2b$10$dO7FpaSdHN6BWareIz.u0e2Ac.J0T5tybx1GkzfMnJSgIsP4N0M6C	Nila Miah	+880 016 64656033	customer	t	\N	\N	REFMJ6QSD3B0	2025-07-28 21:53:27.33	2025-12-15 05:57:44.906	t	f	\N	\N	\N
fd4daa98-ab92-403e-92ae-e0b53df50a2e	parvin.islam1@example.com	$2b$10$SRGvSACIbzY4wAEI42IKN.ebudlSWttLM9hYkVrF.5XpW6P6WByBG	Parvin Islam	+880 016 90449471	customer	t	\N	\N	REFMJ6QSD5K1	2024-06-25 11:40:01.538	2025-12-15 05:57:44.985	t	f	\N	\N	\N
c08bc257-f937-46bf-8236-b2a39172ecaf	jahan.das2@example.com	$2b$10$9KSAVt/B1liLtHN.U5HIn.lLyI9gc272WTsFFd6.GeeiHfOXWsIuC	Jahan Das	+880 016 72920897	customer	t	\N	\N	REFMJ6QSD7H2	2025-08-03 02:14:27.941	2025-12-15 05:57:45.054	t	f	\N	\N	\N
922bbea7-c0db-464e-8b3c-5f79d4fc50fb	nila.pal3@example.com	$2b$10$UrZHzGrSgdkmErnISM/ZE.aqdslM32CeF/GgghK5j.XXIooMp13ou	Nila Pal	+880 017 12079699	customer	t	\N	\N	REFMJ6QSD9H3	2024-03-24 07:50:48.847	2025-12-15 05:57:45.126	t	f	\N	\N	\N
9223991c-97da-46d8-967d-c94220fb5636	farhan.chowdhury4@example.com	$2b$10$1y1BUa6InEu1HYWqryDiXOaGlUYyY0WQ3lhM/KDLGoPJg7H5LgfDC	Farhan Chowdhury	+880 017 25899602	customer	t	\N	\N	REFMJ6QSDBG4	2025-07-11 03:06:22.159	2025-12-15 05:57:45.198	t	f	\N	\N	\N
488ca528-8d43-4987-91ac-35ac059107f3	jasmine.khan5@example.com	$2b$10$VtIQ.1yuC6VKi7MaQMkpfOMCXoItQoHUh3Y5NFPVL/HGK95E8o3S.	Jasmine Khan	+880 015 97606463	customer	t	\N	\N	REFMJ6QSDDD5	2024-05-01 03:20:14.124	2025-12-15 05:57:45.266	t	f	\N	\N	\N
cc859a5a-e7b4-4d47-9e05-a308bb52df12	jamal.das6@example.com	$2b$10$txJPxRBilxvIkp57pkyBV.fOfNE4nK8X01lzr9NUfbHwgrUZ2dtyK	Jamal Das	+880 019 59011047	customer	t	\N	\N	REFMJ6QSDFC6	2024-11-16 23:04:52.204	2025-12-15 05:57:45.337	t	f	\N	\N	\N
2453ca0f-707e-4ddd-8dbc-2bf80b25425f	mamun.sen7@example.com	$2b$10$13JM/DppDvvsyX7OYiK6tuqqxXLTmzwoZ4aqp3pUIvMje0NOG2oDi	Mamun Sen	+880 016 40609126	customer	t	\N	\N	REFMJ6QSDH87	2024-11-11 21:03:17.088	2025-12-15 05:57:45.404	t	f	\N	\N	\N
8243dc32-b756-4459-826b-32143b49626f	shanta.bhuiyan8@example.com	$2b$10$D0Py409Mw39cRSAwlousnuYkIRsfOOhkkzDh6VQB9kZLuzoLEBNju	Shanta Bhuiyan	+880 017 40211809	customer	t	\N	\N	REFMJ6QSDJ38	2024-10-02 15:56:25.303	2025-12-15 05:57:45.472	t	f	\N	\N	\N
272fbe38-a6bf-491a-bcea-38145973741c	taslima.miah9@example.com	$2b$10$fZzkOhe.wl0fqPDokNczguaFvgNYpmFsKkBOe.oDU2ExadEjIBVSK	Taslima Miah	+880 019 31722677	customer	t	\N	\N	REFMJ6QSDKY9	2024-04-01 21:19:25.089	2025-12-15 05:57:45.539	t	f	\N	\N	\N
c56469d3-9a58-431f-b19b-3ad27728a232	jamal.sheikh10@example.com	$2b$10$ZY0kk00kx/jxOeyxgF0FmeGjnu6xIfG6V498UxJDRyI5v0h6wwdVe	Jamal Sheikh	+880 017 94651854	customer	t	\N	\N	REFMJ6QSDMW10	2025-01-10 10:41:53.727	2025-12-15 05:57:45.608	t	f	\N	\N	\N
81b0db1b-6509-4bee-9a9d-ee5581c2343e	shahana.biswas11@example.com	$2b$10$zuja3z6SFS8YRP.Ln2emaeJgz3qbstNgUSK57C4DCDd5ewG/ZxtBK	Shahana Biswas	+880 018 96620294	customer	t	\N	\N	REFMJ6QSDOR11	2024-01-29 04:42:08.207	2025-12-15 05:57:45.676	t	f	\N	\N	\N
26554680-7395-4130-bc19-d920f30fbae2	karim.uddin12@example.com	$2b$10$tpzH5UXUXkirBHYyLmEAkezzBpQVpBKhXPgE9ebqtS2VBqv.yXaOG	Karim Uddin	+880 017 46199797	customer	t	\N	\N	REFMJ6QSDQN12	2024-01-07 22:13:25.294	2025-12-15 05:57:45.744	t	f	\N	\N	\N
2b779993-9e07-4f53-b6c7-33f0ffd2f042	rony.dey13@example.com	$2b$10$wvm6.FdZLMCOcbCF2BlsW./y/labXm//FUk5VTHFlvSuo5rc31ujy	Rony Dey	+880 015 44391309	customer	t	\N	\N	REFMJ6QSDSJ13	2024-01-01 06:17:36.899	2025-12-15 05:57:45.812	t	f	\N	\N	\N
47227c03-34dc-42c0-bddf-d748a9beba10	jahan.alam14@example.com	$2b$10$ZXsxUpyzckTU6HLKT7blpeIdXSctmZRGVe9.P4nVDRpFRC53lkVTS	Jahan Alam	+880 018 37921045	customer	t	\N	\N	REFMJ6QSDUF14	2024-05-14 22:20:30.656	2025-12-15 05:57:45.88	t	f	\N	\N	\N
7b9fcba0-34fd-4a82-b5f6-9d6c77194355	nila.miah15@example.com	$2b$10$QbCEXhUJoK.Bo5L925J5JOvs4YPNmJDrliLtawuZ66h1Xj/fLMsmG	Nila Miah	+880 019 21037427	customer	t	\N	\N	REFMJ6QSDWC15	2024-10-10 05:09:21.741	2025-12-15 05:57:45.949	t	f	\N	\N	\N
605bbe65-0216-4e65-9b3d-bb86a1e5d13e	jahan.choudhury16@example.com	$2b$10$SRNxJFsx4yaWzokkT9Jm3eA1Pw7N9ZxBqx7Z.U4hOgDU06gSC8Vw6	Jahan Choudhury	+880 019 54075862	customer	t	\N	\N	REFMJ6QSDY816	2024-02-20 01:25:20.191	2025-12-15 05:57:46.017	t	f	\N	\N	\N
7dc69beb-af9c-45f4-869a-75c95f3511c2	keya.bhuiyan17@example.com	$2b$10$OChpwsPnvjDxRnw6c8tVbuJZ5Gthv/UUh6tTb2/qE119QDhpv6ghu	Keya Bhuiyan	+880 018 95385806	customer	t	\N	\N	REFMJ6QSE0617	2025-08-11 14:23:03.159	2025-12-15 05:57:46.088	t	f	\N	\N	\N
3f1974be-69c1-4f34-a3ba-76f7c247d036	imran.chowdhury18@example.com	$2b$10$07/zTE6P/fEbEmY8R3kM3.NCzdwebczYWwVoM3u7JyeEgWk0x5dO6	Imran Chowdhury	+880 018 71688590	customer	t	\N	\N	REFMJ6QSE2318	2025-04-24 07:24:58.289	2025-12-15 05:57:46.156	t	f	\N	\N	\N
bff038f5-885d-4899-ab7d-fbad12057cc5	nasreen.majumdar19@example.com	$2b$10$YLFVCgig5lwwnBGGnyNZO.f6ZTzeaeSbjJ2MsRLPmWkduZYZ.onC2	Nasreen Majumdar	+880 013 59209008	customer	t	\N	\N	REFMJ6QSE3Y19	2025-10-16 06:46:44.564	2025-12-15 05:57:46.223	t	f	\N	\N	\N
aa02dc7a-09dd-4b3e-9931-499a150f9caf	jahan.majumdar20@example.com	$2b$10$kVCjE8LhVi5KJm8m/aDVo.BfIYn2ESzTdGVe5h/dic8pP4iJJ7NE6	Jahan Majumdar	+880 016 94759424	customer	t	\N	\N	REFMJ6QSE5U20	2025-04-05 16:17:15.058	2025-12-15 05:57:46.291	t	f	\N	\N	\N
09df5071-4f13-446c-8480-862f76612f4e	tania.haque21@example.com	$2b$10$adn.9iJE9UbjE0FzCa2xh.gdUbYY6fYHhPkcr/j1Viu4U1oyhjyLq	Tania Haque	+880 013 19115832	customer	t	\N	\N	REFMJ6QSE7U21	2024-11-21 05:00:08.452	2025-12-15 05:57:46.363	t	f	\N	\N	\N
0c17e3fc-2840-4f02-bdba-eb3a6158b79b	sultana.barman22@example.com	$2b$10$Z/aQ8L3ePOYpB7A21ws1cuA8SSRpMKVPsNYb66nmjEBqIZAC4L5Ca	Sultana Barman	+880 019 20611622	customer	t	\N	\N	REFMJ6QSE9P22	2024-08-25 02:23:26.518	2025-12-15 05:57:46.43	t	f	\N	\N	\N
7681098c-846c-4635-b118-e1a0635f9def	parvin.islam23@example.com	$2b$10$8arZ6EPkHM.ZzbtZP/iFl.PiYUY0O4Ccu4g4kvc3EZ3WQ.F0SaPZO	Parvin Islam	+880 013 71344406	customer	t	\N	\N	REFMJ6QSEBT23	2024-09-25 22:59:38.086	2025-12-15 05:57:46.506	t	f	\N	\N	\N
43117370-3920-4dd3-8a9b-ffc3b3f98e2a	razia.das24@example.com	$2b$10$YoUzbEMbN1/pxYVU2oHB8OZecYEfFmz42WYlt3H4D6Kdk9b1FyAlK	Razia Das	+880 019 28656425	customer	t	\N	\N	REFMJ6QSEDT24	2025-01-20 23:16:32.816	2025-12-15 05:57:46.578	t	f	\N	\N	\N
63ccdba5-967b-419a-9ced-f433308e38ce	begum.miah25@example.com	$2b$10$r84ZJFPAo8kbtk3Cifclr./59/dK/zHVsnYTxCBh1u7COMFPMBI/y	Begum Miah	+880 019 35159322	customer	t	\N	\N	REFMJ6QSEFS25	2024-12-01 09:25:50.582	2025-12-15 05:57:46.649	t	f	\N	\N	\N
a283a6b4-0be8-435d-b6c9-d73990c492ff	rahman.karim26@example.com	$2b$10$564DcY.8PuU.Y4TMw0nFZuAejGsLpixrhhkPxuMrJesXs1QNM/15a	Rahman Karim	+880 013 28218771	customer	t	\N	\N	REFMJ6QSEHU26	2024-04-10 04:06:01.42	2025-12-15 05:57:46.723	t	f	\N	\N	\N
b915ccd9-580b-4821-aa7a-0dcf88f7bb16	sultana.saha27@example.com	$2b$10$zseaggoTKT6dzg6Yz9P7fejxnGCB8.g2Wwq/9MfFuS0XYvvb2hYhu	Sultana Saha	+880 016 40442906	customer	t	\N	\N	REFMJ6QSEJZ27	2025-11-09 06:01:26.849	2025-12-15 05:57:46.8	t	f	\N	\N	\N
f8944dfa-6ac9-47e5-a9d9-12aff793848a	ali.sen28@example.com	$2b$10$OKYa873QLU7irV15luWN5OhUcQO6H542aGAJBXOh/K/tBvY0lkN0W	Ali Sen	+880 013 67551833	customer	t	\N	\N	REFMJ6QSEM028	2024-07-12 17:13:14.108	2025-12-15 05:57:46.872	t	f	\N	\N	\N
32e3dd81-0b14-4dfb-bb68-22b8607f29d4	miah.rahman29@example.com	$2b$10$BZ8DanldOQUIpB6wl.FHSOlB9bZlBbdks5yDF0MbGycUpe8BVFNrC	Miah Rahman	+880 019 85076088	customer	t	\N	\N	REFMJ6QSENX29	2025-06-24 17:13:50.26	2025-12-15 05:57:46.942	t	f	\N	\N	\N
430345f8-608c-4486-b29f-450d6d1c9a05	islam.choudhury30@example.com	$2b$10$nVbIgrO/omoVgFDgeok1/OITiE/Loht9leXpNeijEG63orvsMTJZ.	Islam Choudhury	+880 015 27843626	customer	t	\N	\N	REFMJ6QSEPW30	2025-10-15 15:53:36.245	2025-12-15 05:57:47.013	t	f	\N	\N	\N
17619ad3-9b3a-41ad-b1b7-e25a3280c511	nusrat.mondal31@example.com	$2b$10$8VfKusXDEgcffj.sHiZn2OfsdXhrIiVSVVHmjtDcJicMJ2Lp04D7O	Nusrat Mondal	+880 015 77593141	customer	t	\N	\N	REFMJ6QSERX31	2024-08-12 08:28:39.824	2025-12-15 05:57:47.087	t	f	\N	\N	\N
60949048-10b9-40fb-b496-eed5117838f6	shanta.uddin32@example.com	$2b$10$lIk/kWi04zdTS/yYzac6Zutn0dqvrjxma7.2iJKmED2liEpSZB9xO	Shanta Uddin	+880 018 16410657	customer	t	\N	\N	REFMJ6QSETU32	2025-06-29 12:37:27.747	2025-12-15 05:57:47.155	t	f	\N	\N	\N
47e888ce-79bf-4eaf-82ea-69206124a5dc	bibi.saha33@example.com	$2b$10$G/gPpg3rVn6UaJU2ejy7sO001/0vk8M4gxVsHC53xUZpEd9.u4Mcy	Bibi Saha	+880 017 44402933	customer	t	\N	\N	REFMJ6QSEVQ33	2024-09-22 21:59:47.623	2025-12-15 05:57:47.223	t	f	\N	\N	\N
5975ea1c-3a10-4cd8-99a1-05ab15a12d98	mahfuz.sikder34@example.com	$2b$10$yOlQ88Ex4IC455UN/U9e4.3USOiWwPEvFRDLnKc1l..eChqjKrXz2	Mahfuz Sikder	+880 013 30004051	customer	t	\N	\N	REFMJ6QSEXN34	2024-08-13 00:38:47.75	2025-12-15 05:57:47.292	t	f	\N	\N	\N
3b797cc5-c1a7-4f62-9b65-b3becaed86eb	nila.majumdar35@example.com	$2b$10$ADAmctfTrJzKYFXSUoBpfubXOevfmO3IaYwbtrTFRFXBPYI0Zfe9S	Nila Majumdar	+880 019 55476293	customer	t	\N	\N	REFMJ6QSEZK35	2025-08-12 07:42:07.634	2025-12-15 05:57:47.361	t	f	\N	\N	\N
e01e9d78-81ec-4b88-b435-dba83aad41a7	jewel.chowdhury36@example.com	$2b$10$fyjolnHvP/5aU.H0dw0gme6oyn2nzAJG5Y470oQqZmr.SmosCvJCO	Jewel Chowdhury	+880 016 43118211	customer	t	\N	\N	REFMJ6QSF1M36	2025-06-19 17:55:24.042	2025-12-15 05:57:47.435	t	f	\N	\N	\N
d2d3d1e8-3936-402e-a2ac-7c90282444b5	sheikh.karim37@example.com	$2b$10$AzSC6ASfbqLK9sAAbvhdsOIhF4VbRu8ni0GrKPJquASZJBNlRr9IK	Sheikh Karim	+880 013 19479124	customer	t	\N	\N	REFMJ6QSF3M37	2024-02-26 22:32:20.94	2025-12-15 05:57:47.507	t	f	\N	\N	\N
3d47ad3a-b6ac-422e-a578-e343482ca51f	karim.islam38@example.com	$2b$10$la39MEO6Kqe1ib/1R9/Z6uHGuvLAbYOW4tGfROzn0LUGvjcj1dVb2	Karim Islam	+880 016 49064610	customer	t	\N	\N	REFMJ6QSF5H38	2024-08-22 14:46:22.76	2025-12-15 05:57:47.574	t	f	\N	\N	\N
36d05b2a-7196-470d-80ee-45790a9f3ddb	khan.majumdar39@example.com	$2b$10$rQpW9zMkniMkuvaAbEp5vO6T7cg1GWASUuCq2Sq.kMNz4xFDUA1aO	Khan Majumdar	+880 016 50996286	customer	t	\N	\N	REFMJ6QSF7F39	2025-12-10 14:12:11.61	2025-12-15 05:57:47.644	t	f	\N	\N	\N
810af54e-348f-4885-b4d5-c8cffb4e31f0	shanta.ali40@example.com	$2b$10$s3cGOo/b5i1qXbcEPRv2v.Q6J.HAmsPMgrLitzQE5Yu1XurNlV5CG	Shanta Ali	+880 013 39005087	customer	t	\N	\N	REFMJ6QSF9840	2024-03-08 06:29:10.449	2025-12-15 05:57:47.709	t	f	\N	\N	\N
68144420-c66f-48ed-8230-551ba598348f	ayesha.sheikh41@example.com	$2b$10$eL/i7mWi5UnlJkdTzW1XY.5tLIGiqTs9fRX3h8H17vBn7kl/NRp5K	Ayesha Sheikh	+880 018 46649117	customer	t	\N	\N	REFMJ6QSFB241	2024-07-20 10:21:45.018	2025-12-15 05:57:47.775	t	f	\N	\N	\N
f591e6a3-b5ab-4560-8ec1-89c09cec10f6	taslima.haque42@example.com	$2b$10$mNGLE/pKPoEabPhHMamEN.MbW2ZlEvj1qf9cUib46vRGC/QC4zQsK	Taslima Haque	+880 016 89413228	customer	t	\N	\N	REFMJ6QSFCW42	2025-01-31 02:34:59.581	2025-12-15 05:57:47.841	t	f	\N	\N	\N
d631e996-2342-422b-9f29-0631f92d2967	ahmed.sikder43@example.com	$2b$10$wg2SXxJ6jUpW1vIQerwHqOkb0baG/ilIt3yhxZpNB0z7b9w.9tNMW	Ahmed Sikder	+880 016 90326150	customer	t	\N	\N	REFMJ6QSFES43	2025-07-09 18:06:42.604	2025-12-15 05:57:47.909	t	f	\N	\N	\N
bbeaffd2-360f-4302-a1b4-1f457397f884	tariq.ahmed44@example.com	$2b$10$NtnKXfKcsfyU/Q0EOPE3seQPV8F/af1JKEGjmBU3g.m5JQFPkgAv.	Tariq Ahmed	+880 019 93155678	customer	t	\N	\N	REFMJ6QSFGN44	2024-01-11 21:13:31.623	2025-12-15 05:57:47.976	t	f	\N	\N	\N
9523366f-d8de-4984-bf10-2a4c8eee79b4	tania.mondal45@example.com	$2b$10$vxrJeqLN.3E3yxT3D1bqeufAA.y0Qs8F8Sr9NzVllbACoE83sjsT6	Tania Mondal	+880 016 53857456	customer	t	\N	\N	REFMJ6QSFII45	2025-11-12 15:25:50.576	2025-12-15 05:57:48.043	t	f	\N	\N	\N
3de3cc38-2adc-4c8d-98ab-151b10749aa4	nasir.das46@example.com	$2b$10$BYE6Cxzsy7CnbIixanuryO.kUnVHFWd6f0qFDBOONqqE7Ea6/vbtu	Nasir Das	+880 013 59044992	customer	t	\N	\N	REFMJ6QSFKH46	2025-07-06 02:04:14.359	2025-12-15 05:57:48.114	t	f	\N	\N	\N
5dac790b-ee43-444a-baa4-ca9d0bca4f05	polash.majumdar47@example.com	$2b$10$lND9UHOhsd/z300NnzMYBuZpyrY/Cy8KnNKR9qqANkdJdtvtvpaCC	Polash Majumdar	+880 016 35185485	customer	t	\N	\N	REFMJ6QSFME47	2025-08-11 22:42:47.402	2025-12-15 05:57:48.183	t	f	\N	\N	\N
eaaa1501-df61-44e5-aafd-e23afbaa94a5	karim.ali48@example.com	$2b$10$8ey/j.81xp90DUrEek2n8.Fd2ZqfvSc7W45464EAU/YAFxl9Kw7BC	Karim Ali	+880 015 67086099	customer	t	\N	\N	REFMJ6QSFOB48	2025-12-07 06:57:59.589	2025-12-15 05:57:48.252	t	f	\N	\N	\N
ae53397e-25dd-4eda-90d7-ea2796e7a799	akter.bhuiyan49@example.com	$2b$10$CMojkoScbUgMHdaHWDGFbu2SiBIrJsLgDrH1ZToloTheXImMik8Yi	Akter Bhuiyan	+880 013 82846226	customer	t	\N	\N	REFMJ6QSFQ649	2024-09-05 15:42:43.437	2025-12-15 05:57:48.319	t	f	\N	\N	\N
b9149264-bf2a-4184-8744-0ebcf82113ec	razia.paul50@example.com	$2b$10$SHZWW067orMIjtPWQTw49uL3BlXb7aEEbGVd0ZyDVi69sjORyk3K2	Razia Paul	+880 013 86662292	customer	t	\N	\N	REFMJ6QSFS250	2024-04-20 07:09:01.645	2025-12-15 05:57:48.387	t	f	\N	\N	\N
1932d236-8ae9-4f3c-baa7-e3ef6d120621	bibi.majumdar51@example.com	$2b$10$mVIbqLFQwJuL1nCt3sVBFeE0QT7KiTuJT7/hdQ9lbLCm48vlUZq0e	Bibi Majumdar	+880 017 80316037	customer	t	\N	\N	REFMJ6QSFU051	2024-05-19 19:00:06.714	2025-12-15 05:57:48.457	t	f	\N	\N	\N
6299077e-00fa-4b98-b30f-426e0cdbaf12	nasreen.talukdar52@example.com	$2b$10$vZaUCAPmNKSwF4ZH51OlCOLFTdDvisxXIewknH44wiqdZaZ9lsqlW	Nasreen Talukdar	+880 017 76153672	customer	t	\N	\N	REFMJ6QSFVV52	2025-02-04 16:36:54.269	2025-12-15 05:57:48.524	t	f	\N	\N	\N
a0da730f-4f59-46ff-95df-fcd96b6264dd	ali.majumdar53@example.com	$2b$10$.hNpe16F0HR.X5mqEddJru57A4A/9bEzGdmbXpdHhU.oMM5Fn9GJW	Ali Majumdar	+880 016 87001081	customer	t	\N	\N	REFMJ6QSFXO53	2025-07-16 00:35:39.725	2025-12-15 05:57:48.589	t	f	\N	\N	\N
53ce7353-eef4-425a-9b02-4a247c4a787c	khan.haque54@example.com	$2b$10$rakGgJFWgyNUFMoiWRP6HO5iqPX4ozOf.vBp8q1J.xJZuYyLi8oi6	Khan Haque	+880 016 94415452	customer	t	\N	\N	REFMJ6QSFZH54	2024-09-24 18:26:54.788	2025-12-15 05:57:48.654	t	f	\N	\N	\N
8f4bce25-7646-4cdc-a439-f3406f0ad27e	rafiq.karim55@example.com	$2b$10$X6SwwKUQCb1vTBKEo2WoI.saCARp4ahSXnFq07kDUdXML8Xj.uPS6	Rafiq Karim	+880 017 90700618	customer	t	\N	\N	REFMJ6QSG1A55	2025-11-06 21:17:37.296	2025-12-15 05:57:48.719	t	f	\N	\N	\N
ac114518-4f92-40e0-b529-a54de4879df9	shakil.talukdar56@example.com	$2b$10$nACQ2kV9ORPlDmvdPcF8re.yuxyhjZwtDPT4swq7I4sDE93OusALW	Shakil Talukdar	+880 013 95067455	customer	t	\N	\N	REFMJ6QSG3256	2024-05-20 07:00:20.227	2025-12-15 05:57:48.783	t	f	\N	\N	\N
2cf0e807-c2d0-4fd7-a2e6-540706917979	shathi.chowdhury57@example.com	$2b$10$DTvdRmdIXUnurrRscQC70u3zLSjz6thfTV.S6V6fQZrabCihXFU06	Shathi Chowdhury	+880 019 18946118	customer	t	\N	\N	REFMJ6QSG4V57	2025-09-07 21:30:32.974	2025-12-15 05:57:48.848	t	f	\N	\N	\N
08daa91f-c75e-48fd-b96d-4cf1c6a168f0	rubel.karim58@example.com	$2b$10$z8jkSNroyRHu7CAnqPQeludM7swLNkZXyM3yV/JDh4hdVvPsGSLSC	Rubel Karim	+880 017 54156070	customer	t	\N	\N	REFMJ6QSG6P58	2025-07-09 13:29:53.856	2025-12-15 05:57:48.914	t	f	\N	\N	\N
7b5313c1-269d-49a3-8ad1-64e4bee0672e	polash.sikder59@example.com	$2b$10$7fuDe3fpVCaX0EzgT/oE5.w4AkivSF4UOBahVsOsAE1ecNaiFFOyy	Polash Sikder	+880 015 60646751	customer	t	\N	\N	REFMJ6QSG8Q59	2025-07-06 19:25:29.248	2025-12-15 05:57:48.987	t	f	\N	\N	\N
75cbe9b4-9358-419d-b26d-6302637748af	tanvir.islam0@example.com	$2b$10$R4hhgU03y9ZhUCOdhrtFLuzi1x8kq40ExF.AZePQBWc0vOOgaQ3.O	Tanvir Islam	+880 015 52597384	customer	t	\N	\N	REFMJ6QY0WZ0	2025-12-11 07:58:58.35	2025-12-15 06:02:09.062	t	f	\N	\N	\N
91cca8fe-d8c5-4524-81fe-42074b3fd71b	hasan.chakraborty1@example.com	$2b$10$qd6XMXpwDG2ZawtxiZQSuOlQXY6XQYqFeQ4QJ9LPZ88ViJ4PNRi.q	Hasan Chakraborty	+880 018 21225501	customer	t	\N	\N	REFMJ6QY0Z61	2025-09-07 04:06:49.147	2025-12-15 06:02:09.14	t	f	\N	\N	\N
df4dc458-aa22-431a-9bce-0bea9f425be7	shahana.sheikh2@example.com	$2b$10$PEeN8zpmun8BakIlW334SeZ/E8enIWEU4CkPJ.KZ8EXPO2vtJswsW	Shahana Sheikh	+880 016 30281800	customer	t	\N	\N	REFMJ6QY1132	2025-08-30 01:59:24.212	2025-12-15 06:02:09.209	t	f	\N	\N	\N
8ebb6b25-cbcb-43a2-b85d-c481f28a9f7b	devi.sarkar3@example.com	$2b$10$JJet8vn0D108nElhtL.6pekHMR/T69NTyOwYFiUCYO.cbKjdeDJjm	Devi Sarkar	+880 016 24782524	customer	t	\N	\N	REFMJ6QY1323	2024-09-22 06:35:42.005	2025-12-15 06:02:09.279	t	f	\N	\N	\N
fd153d41-4840-4cf8-86af-056c7972842f	begum.sheikh4@example.com	$2b$10$rqwwWzUOSd3ro8APtM6LeOLbVeGOshxKFHXFCAtMxIFJf7n/aC3I2	Begum Sheikh	+880 015 75176856	customer	t	\N	\N	REFMJ6QY1504	2025-05-05 21:14:09.977	2025-12-15 06:02:09.35	t	f	\N	\N	\N
5f2869c7-dbe3-4118-9048-1cbcebeb94a3	jahan.barman5@example.com	$2b$10$.BF3T3IIPcIxpcggwA1yFeGRl1QUGJF/yls6uVeEFU.POsyUo8wBu	Jahan Barman	+880 016 37011133	customer	t	\N	\N	REFMJ6QY16X5	2024-01-14 11:30:16.514	2025-12-15 06:02:09.418	t	f	\N	\N	\N
d8eeb134-9f2c-4ca7-a79e-e6f2df5cb8cb	jewel.rahman6@example.com	$2b$10$i0R.g.eiakhiBLTqmx7PTu1jFizGINFxmCcF7P6VQUXD6Kl2ofTY.	Jewel Rahman	+880 018 64274346	customer	t	\N	\N	REFMJ6QY18T6	2024-02-10 06:50:09.858	2025-12-15 06:02:09.486	t	f	\N	\N	\N
0443c2ab-f31c-4657-b3aa-171dac858026	karim.karim7@example.com	$2b$10$ANnF3m0yXzr10FL6uLJqy.g2lOeXMSCVD80N4RMhvMwaS4Nyd4hGu	Karim Karim	+880 019 17535179	customer	t	\N	\N	REFMJ6QY1AR7	2024-10-13 16:44:35.772	2025-12-15 06:02:09.557	t	f	\N	\N	\N
26b1db8b-8000-46dd-a6bd-6d3a68716a29	rubel.paul8@example.com	$2b$10$/0gs7omAmINU70/lAghhaOg1SSqGsVyOcpADT2tBbTBiuaeP8mpNC	Rubel Paul	+880 015 23670041	customer	t	\N	\N	REFMJ6QY1CM8	2025-06-14 10:50:19.155	2025-12-15 06:02:09.623	t	f	\N	\N	\N
4cadccfb-005f-4610-9990-2adaff59217d	ali.dey9@example.com	$2b$10$PbdUWo8oZ97egwIqCNLZfuZLor0lSO3Epxom5lDKDj51jphAmUiuS	Ali Dey	+880 016 70498376	customer	t	\N	\N	REFMJ6QY1EI9	2024-07-20 07:24:27.112	2025-12-15 06:02:09.691	t	f	\N	\N	\N
93ef544a-734d-4c65-b7f0-73d04d623a20	ritu.paul10@example.com	$2b$10$uIG4R3WCiAW2BmFzFp1/Xu3ibGlFr9UCCBYTIwNwStGaXNrG0XOv2	Ritu Paul	+880 013 78067662	customer	t	\N	\N	REFMJ6QY1GE10	2025-04-04 08:24:38.445	2025-12-15 06:02:09.759	t	f	\N	\N	\N
3efed551-67da-4649-aeb5-2365833a28ed	lima.saha11@example.com	$2b$10$HJvvq0YH3qU.KpuHcdEFiuENY8BMYVWkKOPwovE7cRix7wFlvyKWe	Lima Saha	+880 013 12161337	customer	t	\N	\N	REFMJ6QY1I811	2025-09-11 13:21:17.4	2025-12-15 06:02:09.826	t	f	\N	\N	\N
fba9bd21-79c2-4109-ac24-cd1022482e6c	rony.ghosh12@example.com	$2b$10$fMCyIDGWn1LWbYdNXio.LeWInu1/HqyuKK2Vvye7oldPwkNCM6IOW	Rony Ghosh	+880 015 33849768	customer	t	\N	\N	REFMJ6QY1K412	2025-03-30 12:05:04.553	2025-12-15 06:02:09.894	t	f	\N	\N	\N
d99e47d7-e7c6-429c-88e7-20fd2ff5f535	jahan.alam13@example.com	$2b$10$8JKggmydbJYeAh.OE6TYZuMOFAnsj8EtzAYWn4twbc6p.J0wgOhUi	Jahan Alam	+880 019 37719150	customer	t	\N	\N	REFMJ6QY1LY13	2025-07-24 05:20:23.626	2025-12-15 06:02:09.959	t	f	\N	\N	\N
2acaa6ab-219e-4e4e-a9a6-35d22c5d145b	lima.das14@example.com	$2b$10$SlhxlvxF/j1240.3n0UmqOsu2ypEfumML5QHIPEsmxqOvsE7AxuWa	Lima Das	+880 018 75437589	customer	t	\N	\N	REFMJ6QY1NW14	2024-06-30 12:36:57.096	2025-12-15 06:02:10.03	t	f	\N	\N	\N
e414c180-4d30-456e-8684-b20d5b10a779	rabeya.sikder15@example.com	$2b$10$gM3hmAWmnbxyAUvDiAAKm.kjP/LqDJ0kIlYqfUyLaaECrvcllvmJ2	Rabeya Sikder	+880 016 51888990	customer	t	\N	\N	REFMJ6QY1PR15	2024-12-16 01:34:59.716	2025-12-15 06:02:10.097	t	f	\N	\N	\N
d84df875-c0f8-4e70-895f-f81a7d68b547	begum.ali16@example.com	$2b$10$bttRtyH5skLq4LWHhh80Q.3wDWzCAfzVtxiijsQ9GxbuSyg1Gxcte	Begum Ali	+880 013 88482450	customer	t	\N	\N	REFMJ6QY1RM16	2024-03-04 07:39:21.048	2025-12-15 06:02:10.163	t	f	\N	\N	\N
fe8d4015-efeb-4e74-85ba-cdef069ecdee	rabeya.uddin17@example.com	$2b$10$Mn.i3JyEjbVRCLkDINuwXOVBU5PpmHXH5L0AvtnPS0w1oaHenVSty	Rabeya Uddin	+880 013 52998174	customer	t	\N	\N	REFMJ6QY1TF17	2024-03-01 10:22:04.973	2025-12-15 06:02:10.229	t	f	\N	\N	\N
46adf21b-5f63-402d-a1f3-7488c8dcda84	mitu.saha18@example.com	$2b$10$BlGXsiWoDuZbAh9D6gRRteszjspQHNCtTz2H70pIXGlLQ.dBeKbua	Mitu Saha	+880 013 67385923	customer	t	\N	\N	REFMJ6QY1VB18	2024-09-15 13:06:44.918	2025-12-15 06:02:10.297	t	f	\N	\N	\N
f5d9ecab-74de-4198-894c-8b53c9e3f1bb	lima.dey19@example.com	$2b$10$.KhtR/tiUBGkCDfdgAGxSux.KsdlvsjbioLF9/gATiXsiOXO4bgmm	Lima Dey	+880 017 22171737	customer	t	\N	\N	REFMJ6QY1X819	2024-02-26 17:30:21.938	2025-12-15 06:02:10.366	t	f	\N	\N	\N
c0514f14-1558-46f9-8f72-bbb1eba6eaca	rony.barman20@example.com	$2b$10$RyTlYLy12J2W4H0PRs58s.sN0ONhbL8hlSSa2a24H/6XnUG3/wS4S	Rony Barman	+880 016 50663771	customer	t	\N	\N	REFMJ6QY1Z420	2024-04-17 16:54:21.62	2025-12-15 06:02:10.434	t	f	\N	\N	\N
59b6890e-ab16-46b6-863d-3dc48f6acf9d	parvin.alam21@example.com	$2b$10$z1OFTO24cQePjpzwsrXseeZr0YBQPun0F1NgzL6LJiUkep6e3DCMO	Parvin Alam	+880 016 21630201	customer	t	\N	\N	REFMJ6QY21221	2025-10-04 16:28:02.678	2025-12-15 06:02:10.503	t	f	\N	\N	\N
335daf65-c921-4668-b5f0-337e7a08fd69	rani.talukdar22@example.com	$2b$10$nu/IwT0EZAX/GXCwfrPkyeIfRxTn6CbqjIdzEusH1VjQ8xocI3tHy	Rani Talukdar	+880 017 66066005	customer	t	\N	\N	REFMJ6QY22Z22	2024-01-20 22:21:43.417	2025-12-15 06:02:10.572	t	f	\N	\N	\N
ac1a06fb-eb42-4367-91fd-1c4aead9231a	farhan.sarkar23@example.com	$2b$10$27./Tp9rja.vysBx/yJt8upJQOu3FT/6Gt1GfMGnOcvgNUhqet7HK	Farhan Sarkar	+880 016 70107871	customer	t	\N	\N	REFMJ6QY24V23	2024-03-10 21:41:20.871	2025-12-15 06:02:10.64	t	f	\N	\N	\N
c4d6183b-7c0b-405f-8ef2-ea6483c4ecea	karim.ghosh24@example.com	$2b$10$qE.N8zCAuAW4Xsb/pYJ3Lus7qQ.XSsLUdtn0DvxUr1NXeNXTDcu3q	Karim Ghosh	+880 019 47697835	customer	t	\N	\N	REFMJ6QY26R24	2025-07-25 17:31:34.546	2025-12-15 06:02:10.708	t	f	\N	\N	\N
bb315737-12fc-4853-b953-005e49896a96	islam.barman25@example.com	$2b$10$7m/XUBBBB7eBKNNN8ra1RuBhFNd2VRgv.Lrcu9IuUrQibpRBAWSZ2	Islam Barman	+880 015 67060828	customer	t	\N	\N	REFMJ6QY28P25	2025-06-29 05:18:20.058	2025-12-15 06:02:10.778	t	f	\N	\N	\N
64cd0754-f4a7-4b30-97e8-74472c0c4f06	devi.chakraborty26@example.com	$2b$10$jO42yp6KbCRZuCS0i4B8DO48ndJfW2KCCY2TBi93nM/yQ7QIQSP7W	Devi Chakraborty	+880 018 69516943	customer	t	\N	\N	REFMJ6QY2AQ26	2024-11-13 00:48:40.924	2025-12-15 06:02:10.851	t	f	\N	\N	\N
63238df4-6c08-4b3a-9d78-8e61fa2f0b6a	jasmine.pal27@example.com	$2b$10$oWcpiM/VdS/AqLCTfJ3scerddCGdpKWuNIALYTDI.6tmIf5QehdNW	Jasmine Pal	+880 017 65322046	customer	t	\N	\N	REFMJ6QY2CO27	2025-04-05 04:32:18.36	2025-12-15 06:02:10.922	t	f	\N	\N	\N
3a2b8a32-c242-43eb-99f0-950661d4dad5	sultana.saha28@example.com	$2b$10$785bpXjNLqwAAuTObRBoquasVC40.dGVpb.RGa5O9ka7HXjS1lx1O	Sultana Saha	+880 017 57573074	customer	t	\N	\N	REFMJ6QY2EL28	2024-03-05 19:11:12.892	2025-12-15 06:02:10.991	t	f	\N	\N	\N
00441ee8-e63b-490f-8029-c0c76ce041ff	shanta.biswas29@example.com	$2b$10$/elhadZvqYjWQh3mvudxZ.uNweFfsTaMumLtjlZiiVdyBkPcxRIaS	Shanta Biswas	+880 018 26643330	customer	t	\N	\N	REFMJ6QY2GL29	2025-11-12 05:35:18.874	2025-12-15 06:02:11.063	t	f	\N	\N	\N
2663087e-d987-49f2-8140-768d0cc46cf7	jahan.islam30@example.com	$2b$10$czdq6Nt/ZydPPmVsw7aFPuhBzqL2w1piU8aN0GJRmAM53gUb.yF12	Jahan Islam	+880 013 19464359	customer	t	\N	\N	REFMJ6QY2IH30	2024-11-25 16:46:57.116	2025-12-15 06:02:11.131	t	f	\N	\N	\N
dca90173-1508-4a93-b4c8-dabf3d8f4d69	rani.paul31@example.com	$2b$10$4Ozs6LPDwuwKm/Ynk9iOduEiqLNr24QNqApiDxgEfSRr79DIStSeq	Rani Paul	+880 013 14214374	customer	t	\N	\N	REFMJ6QY2KE31	2024-10-11 10:09:40.281	2025-12-15 06:02:11.2	t	f	\N	\N	\N
2b1e0d87-01e4-4b0c-873e-bc57c66cce7f	fatima.majumdar32@example.com	$2b$10$wYVPj3xG.oVw0b6vnchXFOqTyTqDEZzM70LG7nhpygO.gZE96JlD6	Fatima Majumdar	+880 015 67534357	customer	t	\N	\N	REFMJ6QY2MB32	2024-06-07 00:10:42.882	2025-12-15 06:02:11.269	t	f	\N	\N	\N
850e4d16-88b8-40da-9411-90236947c7fc	farhan.das33@example.com	$2b$10$pSdkkVUsaE7o7BHQM5Tpse8DE9NQMvJpRRvmktHHXogS7ZWHLDjpu	Farhan Das	+880 013 76104801	customer	t	\N	\N	REFMJ6QY2OC33	2025-11-06 09:58:46.806	2025-12-15 06:02:11.341	t	f	\N	\N	\N
e3d32a13-78a0-4a1b-b933-062a20254da7	polash.roy34@example.com	$2b$10$V0bm2.Oq4VWkim1IUoMEzeCB9mYWwKTnEZlrJWkyCGYIIXFJEH7zO	Polash Roy	+880 017 77058461	customer	t	\N	\N	REFMJ6QY2Q934	2025-10-11 11:02:13.885	2025-12-15 06:02:11.41	t	f	\N	\N	\N
4cb38409-3e02-48b7-8fcc-26de1deb0298	kabir.roy35@example.com	$2b$10$YikL7olqjMd/VolbUzzxLOF3y2AMuUHB.b2L52ioWZkmfT3r1x03S	Kabir Roy	+880 015 32477568	customer	t	\N	\N	REFMJ6QY2S335	2024-03-11 16:03:42.522	2025-12-15 06:02:11.477	t	f	\N	\N	\N
2c724956-995b-4277-855e-ea7670109dd1	khatun.chowdhury36@example.com	$2b$10$hgu4hLYraDuv7wHk.n4.FOtkiZnUjNqWZ8NwIzgJUHlgckkmyJgcK	Khatun Chowdhury	+880 016 14193749	customer	t	\N	\N	REFMJ6QY2TZ36	2025-04-19 20:05:10.873	2025-12-15 06:02:11.545	t	f	\N	\N	\N
516fe5a9-b1b7-4202-ae67-2879f585ef10	poly.das37@example.com	$2b$10$PyxiiHMlx3M4xsFHvkKzeOpKwDQS2EuFxuX/ezLMLQWq/aY2YRBNq	Poly Das	+880 015 64867473	customer	t	\N	\N	REFMJ6QY2VW37	2024-09-09 21:59:05.496	2025-12-15 06:02:11.613	t	f	\N	\N	\N
03e11206-def9-49c2-8d22-02838fa34d52	rubel.haque38@example.com	$2b$10$bf1VOsXR4JvzXYL2ws0KxO4SCAjSUrUecGpS9oW11MWh5n0nhrIVm	Rubel Haque	+880 016 15769109	customer	t	\N	\N	REFMJ6QY2XW38	2024-08-25 03:41:37.058	2025-12-15 06:02:11.686	t	f	\N	\N	\N
f1657365-0f30-4643-885e-0ad0847a6747	sultana.chakraborty39@example.com	$2b$10$SYrochLcKB2SPl5dcbEihOjnRnSb/mq34vf8KiKhHfsB/edwtjeIi	Sultana Chakraborty	+880 013 47642419	customer	t	\N	\N	REFMJ6QY2ZQ39	2024-03-14 01:58:02.853	2025-12-15 06:02:11.752	t	f	\N	\N	\N
5aa6ea95-1d61-414f-88ec-ca9d3d31077e	rafiq.miah40@example.com	$2b$10$AS3elm9Zx82J8eU56jxXzOLo.6sVFRM7lDcuSTCehIDJamiz/scp6	Rafiq Miah	+880 017 83305889	customer	t	\N	\N	REFMJ6QY31M40	2024-04-11 20:16:46.549	2025-12-15 06:02:11.82	t	f	\N	\N	\N
11b4c139-dbf6-4e9d-ad8a-d962490aa228	shila.sarkar41@example.com	$2b$10$ICslHvLoKdVq16WUKDgEu.h0oJzlYJ4uQbr86vo8mNxgyU2KtnwSm	Shila Sarkar	+880 013 35326361	customer	t	\N	\N	REFMJ6QY33H41	2024-04-13 18:11:23.286	2025-12-15 06:02:11.887	t	f	\N	\N	\N
eb602ba3-8602-45fd-8c2d-65fa4b5028e4	mahfuz.majumdar42@example.com	$2b$10$g15AmN5KcFEfjxeYyPz4h.yKNuhC/Tn.ZmWdQJEvoBVj7ngNSVVvu	Mahfuz Majumdar	+880 019 10989253	customer	t	\N	\N	REFMJ6QY35B42	2025-07-18 15:24:26.039	2025-12-15 06:02:11.952	t	f	\N	\N	\N
47299316-7b0d-4769-9252-f160ec56393f	tanvir.saha43@example.com	$2b$10$RsDV//OhhBTj5IlRmSt/Pe2rU0N1PUiX7Qt/mhk/KoJFtLB3yUGUa	Tanvir Saha	+880 015 20902319	customer	t	\N	\N	REFMJ6QY37643	2025-03-30 08:12:24.11	2025-12-15 06:02:12.019	t	f	\N	\N	\N
7caf1a37-c0f0-47cc-9551-3cfde7cb6c43	sabbir.alam44@example.com	$2b$10$S7V84zRfGOScgfR5yHcrGeExFUWgQnkj7gi4upzcCWx7wIEoZlDCW	Sabbir Alam	+880 017 57148933	customer	t	\N	\N	REFMJ6QY39144	2024-09-26 06:38:21.142	2025-12-15 06:02:12.086	t	f	\N	\N	\N
e8166565-8c74-4128-a6d1-19b05c9d5478	nasir.sarkar45@example.com	$2b$10$AuX7apOv/N4.YqB/7y/cnOzd96QOoRhkvTHWfFvxjUNVlI1fbcGN2	Nasir Sarkar	+880 019 21853276	customer	t	\N	\N	REFMJ6QY3AY45	2025-08-19 08:04:25.849	2025-12-15 06:02:12.155	t	f	\N	\N	\N
1844e2c5-329d-45da-8893-bfa6b83e24b7	chowdhury.das46@example.com	$2b$10$D.GPvFcKvvYJabt/XEb7WOYlKmUxDf9MGjP6K.xPpov8Z151LB1Uy	Chowdhury Das	+880 017 46028800	customer	t	\N	\N	REFMJ6QY3CX46	2025-02-15 01:56:06.028	2025-12-15 06:02:12.227	t	f	\N	\N	\N
c448320c-48f0-4fb8-a60a-d717ae988643	bibi.chowdhury47@example.com	$2b$10$Kimh7CjH12HnICZnky2cLuIqwKGqM8rr68Shm/769oUc04dMeO78y	Bibi Chowdhury	+880 019 60747965	customer	t	\N	\N	REFMJ6QY3ET47	2024-12-19 18:23:23.443	2025-12-15 06:02:12.294	t	f	\N	\N	\N
9e98be3b-35d9-464d-93d4-9ab587694628	lima.khan48@example.com	$2b$10$DJAon8d/LhPcHTkePKzTmuCOkbYZN89Zuzsij8Tof1oe6hjXYEOlK	Lima Khan	+880 016 67256698	customer	t	\N	\N	REFMJ6QY3GN48	2025-05-25 03:07:20.434	2025-12-15 06:02:12.36	t	f	\N	\N	\N
55db5c41-bb36-438d-879f-66198778df0a	begum.sheikh49@example.com	$2b$10$kSdu7YUpGyWkj/zjVfllU.IFswrSVZbQCIongt3Vkgn9Jw0Aw300G	Begum Sheikh	+880 013 67356311	customer	t	\N	\N	REFMJ6QY3IK49	2024-09-12 11:31:43.545	2025-12-15 06:02:12.429	t	f	\N	\N	\N
3bb45bf8-5d6c-4896-a3c5-84f82148ec85	mahfuz.chowdhury50@example.com	$2b$10$iWD56Wx2eQZmQ.5Rc50n0OKs2pfsEJ.MVBMOlXg0QfW6IJNiqZH/e	Mahfuz Chowdhury	+880 016 85781567	customer	t	\N	\N	REFMJ6QY3KD50	2025-08-12 08:37:12.742	2025-12-15 06:02:12.494	t	f	\N	\N	\N
5ff6ba81-21db-484c-8f3b-8748e5a4cfe1	akter.khan51@example.com	$2b$10$SofmFWhOyAM5KT0LgGMLb.HIS7f3TTTWUWDaQhZR.438Qinny5adO	Akter Khan	+880 018 64892711	customer	t	\N	\N	REFMJ6QY3M751	2025-09-26 21:48:32.704	2025-12-15 06:02:12.56	t	f	\N	\N	\N
474e2f00-63bd-4447-9dd2-6d23328d5b9e	fatima.haque52@example.com	$2b$10$TaIYr1LdVtoA0YsShpBbJ.8.t.3Hw1SHyZgr8xg2LZIHcCUBd9b9y	Fatima Haque	+880 015 89385097	customer	t	\N	\N	REFMJ6QY3O052	2025-02-15 10:51:16.179	2025-12-15 06:02:12.626	t	f	\N	\N	\N
1ff71d44-a5ec-4a83-bdef-04a45113c006	moni.talukdar53@example.com	$2b$10$oPXoYz8YGsWRiPnOvGR9A.u5cXvDFwuxjf9sND/eBITjkvqU3kefO	Moni Talukdar	+880 017 48049009	customer	t	\N	\N	REFMJ6QY3PV53	2025-07-23 19:39:13.885	2025-12-15 06:02:12.692	t	f	\N	\N	\N
93d31788-6c1f-4684-af07-0fb694f190f2	keya.chowdhury54@example.com	$2b$10$BuPu67Z7kHucal0I22Zlq.tUI/w7CQ4j1JnJnDTjS3nsXdgf3YDa.	Keya Chowdhury	+880 013 22144644	customer	t	\N	\N	REFMJ6QY3RQ54	2025-02-06 02:05:38.894	2025-12-15 06:02:12.759	t	f	\N	\N	\N
5421a495-b2a1-4b22-8150-4cfd497d7d81	moni.islam55@example.com	$2b$10$4OLsaSMbGjQ0JyJsqHCWPO8JWn4H2uBHiFnPdWHxNF9dEtwtxw3V6	Moni Islam	+880 015 94505673	customer	t	\N	\N	REFMJ6QY3TK55	2025-09-21 00:25:38.613	2025-12-15 06:02:12.825	t	f	\N	\N	\N
75f36166-33a3-48e5-8633-e6dfa7fd36ba	rabeya.rahman56@example.com	$2b$10$FGuXDTdElAF9xk7jeQC2eu6.s6jENRV0TK4ocve2//eHVTFddXj1W	Rabeya Rahman	+880 017 90135931	customer	t	\N	\N	REFMJ6QY3VD56	2025-02-08 15:16:20.602	2025-12-15 06:02:12.891	t	f	\N	\N	\N
28f71c5a-5225-45ca-bdd1-e28175567ccb	uddin.chakraborty57@example.com	$2b$10$Ru4Z768mqXK8h5p4XkJThOkE/mAeDWY.ykiygATV/vcQ/1H2bQjhm	Uddin Chakraborty	+880 019 49162972	customer	t	\N	\N	REFMJ6QY3XA57	2025-12-07 10:19:48.219	2025-12-15 06:02:12.959	t	f	\N	\N	\N
64559550-fa88-4391-9a55-6113785a9c23	shathi.sen58@example.com	$2b$10$FV/vXgM9TIccGnHYWFMGSeAZ.iK.XGTOKDR.0viD617ev49S69HaS	Shathi Sen	+880 019 52904587	customer	t	\N	\N	REFMJ6QY3Z858	2025-07-03 10:13:34.153	2025-12-15 06:02:13.029	t	f	\N	\N	\N
b7b6d8c4-7933-48c1-a89a-d450aaf92591	khan.roy59@example.com	$2b$10$fuPcmbiJpCQn1VXTDhz3PetJmxxWlyplIkKuWz2hTObIW3tNR.Deu	Khan Roy	+880 013 28065686	customer	t	\N	\N	REFMJ6QY41359	2025-06-07 05:11:53.465	2025-12-15 06:02:13.096	t	f	\N	\N	\N
240f94f1-11ef-49f2-8005-1ffc62c256cd	parvin.islam0@example.com	$2b$10$hd8cGYFWSKL1b.Yymz7sLuJcjKbq/9OUfPEYN4GKkTswaXvqS2nMu	Parvin Islam	+880 019 55688243	customer	t	\N	\N	REFMJ6R1OUH0	2024-08-02 16:12:34.883	2025-12-15 06:05:00.044	t	f	\N	\N	\N
f4e7be0f-0db2-4710-927c-32028dd9bff1	imran.sen1@example.com	$2b$10$2YNe3PxCEyi/L5TTkRZ3.eMxH.UsceJ8/gcYK92jZrX2VxclU.1Mm	Imran Sen	+880 013 43393782	customer	t	\N	\N	REFMJ6R1OWO1	2024-04-21 19:49:55.859	2025-12-15 06:05:00.122	t	f	\N	\N	\N
cd06bce5-c109-41e0-a5df-f72dae9d4fbf	jamal.biswas2@example.com	$2b$10$/svhTxr0jtKzKARTjMp8YOKkdyFDrHiTLHSq5eLyIg0oL4hBTDS7.	Jamal Biswas	+880 018 17826112	customer	t	\N	\N	REFMJ6R1OYJ2	2024-11-30 12:16:10.359	2025-12-15 06:05:00.189	t	f	\N	\N	\N
62342b6c-2fd9-41c4-9ac4-9aa964069539	miah.ghosh3@example.com	$2b$10$ZO4hw77iJRXUWlL1LEq9e.xbHdxal9du9SPhnxotxELqLKX36HorW	Miah Ghosh	+880 015 77462022	customer	t	\N	\N	REFMJ6R1P0H3	2025-04-16 00:14:49.738	2025-12-15 06:05:00.259	t	f	\N	\N	\N
38efac26-843d-495e-ab0a-4621dec4c866	nasir.miah4@example.com	$2b$10$iUeSLOE..rg.jAz7FJPShuwbQJMgzow/oNcyS8opiyMobJM6FAu3W	Nasir Miah	+880 019 30378367	customer	t	\N	\N	REFMJ6R1P2I4	2025-09-04 12:55:58.709	2025-12-15 06:05:00.332	t	f	\N	\N	\N
ef7c44fd-6860-4488-9a24-8c1e32ce3d90	shakil.karim5@example.com	$2b$10$sFoN0zUOisV2s7Muui/RpuirgjNR8tt3XtT6vxPMZM8U7llvXjcM2	Shakil Karim	+880 018 64814070	customer	t	\N	\N	REFMJ6R1P4J5	2024-03-23 15:44:36.112	2025-12-15 06:05:00.405	t	f	\N	\N	\N
251337d7-de77-4f6f-9aab-6b22f4e60783	jasmine.alam6@example.com	$2b$10$geP9awDj5thRNcjw5x/Yt.kVQQYF8Lj1MXMiTdLBLav8AgEmiYJyi	Jasmine Alam	+880 017 27199623	customer	t	\N	\N	REFMJ6R1P6O6	2024-03-26 07:42:48.364	2025-12-15 06:05:00.481	t	f	\N	\N	\N
e0a7d00f-b7d0-4569-b74f-66e65223df44	nusrat.ghosh7@example.com	$2b$10$2HFRtcQLvUsNWAqXWMUC5ezP8NP2QFhWhO4E3W9alS/98PZZRs03u	Nusrat Ghosh	+880 017 84442838	customer	t	\N	\N	REFMJ6R1P8O7	2025-03-09 04:55:34.481	2025-12-15 06:05:00.554	t	f	\N	\N	\N
9d1581dd-ac3f-4b03-a76e-b782a438e611	kabir.paul8@example.com	$2b$10$qZUKkcuSCUMm0e8Tp0QSY.5vttD4YOQGt.XZVq3rtLHJIOY32uDaC	Kabir Paul	+880 016 75522974	customer	t	\N	\N	REFMJ6R1PAR8	2025-05-16 23:40:07.075	2025-12-15 06:05:00.629	t	f	\N	\N	\N
6f7c4b1a-20e6-48e6-ab58-1daf35cd3767	ali.sen9@example.com	$2b$10$VDSye/c1i9tbFbvtdIilp.nnjrq033RkXi2fyiSlpx5iL/r4SmG3C	Ali Sen	+880 015 30732188	customer	t	\N	\N	REFMJ6R1PCU9	2024-08-04 00:20:37.908	2025-12-15 06:05:00.704	t	f	\N	\N	\N
50c56248-cf47-41c0-9f14-118cba706f6b	imran.sarkar10@example.com	$2b$10$AxVwuA8iL8tES7LWM2aUreluKQ60Sss0GapDPnz1ZDUaESfSaW0A.	Imran Sarkar	+880 018 69214902	customer	t	\N	\N	REFMJ6R1PEV10	2024-07-25 02:41:14.552	2025-12-15 06:05:00.777	t	f	\N	\N	\N
ee95e632-ea0d-475f-8dbf-5ce1a4156243	shahana.khan11@example.com	$2b$10$YjR2iEzlqWB8zUGXs86YRe0tf.fa74Q49C/cdEy/L0kXFlYrw8HuO	Shahana Khan	+880 015 17639535	customer	t	\N	\N	REFMJ6R1PGX11	2024-06-09 16:58:57.011	2025-12-15 06:05:00.851	t	f	\N	\N	\N
d0a2d960-3846-4352-b224-edb3fc081c09	fatima.chakraborty12@example.com	$2b$10$urFKW6J0/XSauKTuIuuAjeU5bb5fON5s7APfBiBRNfd08kQQNymZC	Fatima Chakraborty	+880 013 53080834	customer	t	\N	\N	REFMJ6R1PIT12	2024-07-19 09:22:51.234	2025-12-15 06:05:00.919	t	f	\N	\N	\N
0ac00050-d7da-47d9-b711-a3c0bc3ed525	chowdhury.chowdhury13@example.com	$2b$10$pqE9kYFXGIj1Vgu9OwYDYO9.fwwaaep4iRh7JgTxE9kdJbgqjOvlK	Chowdhury Chowdhury	+880 018 95904489	customer	t	\N	\N	REFMJ6R1PKP13	2025-02-26 18:32:19.541	2025-12-15 06:05:00.987	t	f	\N	\N	\N
41f390c0-b7d2-4eb6-a69c-ea04b1a61178	karim.choudhury14@example.com	$2b$10$YJN7KELylYMp4MMyRQ4Lp.byDoQa.Wm5OwsgaEVOk3pSVWvt29iIm	Karim Choudhury	+880 017 14970084	customer	t	\N	\N	REFMJ6R1PML14	2024-11-07 21:44:09.567	2025-12-15 06:05:01.054	t	f	\N	\N	\N
993e360b-d5fd-4277-9080-aee02215087b	bibi.das15@example.com	$2b$10$hjs0JS2OkxPSoRrTQW1bRuRfpn9OitoX6AcK9ZW.NP3Oq0lnryVvy	Bibi Das	+880 017 28699393	customer	t	\N	\N	REFMJ6R1POH15	2025-05-08 03:48:04.293	2025-12-15 06:05:01.123	t	f	\N	\N	\N
4cf89320-b8f5-411c-9437-0720bb452873	jasmine.sen16@example.com	$2b$10$WYaEKf4nMV0Lei0V0iiLH.GTIhUBifw06SEbK0lZ0Xzz2fsPhbnXy	Jasmine Sen	+880 018 33556250	customer	t	\N	\N	REFMJ6R1PQG16	2024-05-17 19:33:04.774	2025-12-15 06:05:01.194	t	f	\N	\N	\N
db1da04f-9d6a-49cc-93da-e9d464fdc12e	rani.majumdar17@example.com	$2b$10$DdU.RJLm.Dy7gKgY1diLDeMWF9wWhVWd8y0NqL.w8KkFWbx6hgIrq	Rani Majumdar	+880 018 73862989	customer	t	\N	\N	REFMJ6R1PSC17	2025-10-28 22:48:29.555	2025-12-15 06:05:01.262	t	f	\N	\N	\N
40e0ed3e-b486-442e-9aff-1a3279656d4c	razia.sheikh18@example.com	$2b$10$IKoXXLI4VkPt6AST0vf.oOOKWP4rSb0z6yNc6V1ggMHP3ea5b2SsK	Razia Sheikh	+880 016 33174192	customer	t	\N	\N	REFMJ6R1PU818	2025-08-01 05:32:40.081	2025-12-15 06:05:01.329	t	f	\N	\N	\N
e5054dbf-8709-4fd6-b793-0db56e06d29d	polash.miah19@example.com	$2b$10$ufuwFFyTwDuNaxH.Mc.aYutqdW4Itb/82b7eZnxzFUkLRp6.0RDJm	Polash Miah	+880 018 12491817	customer	t	\N	\N	REFMJ6R1PW819	2024-06-08 11:09:54.052	2025-12-15 06:05:01.401	t	f	\N	\N	\N
ae65a2a1-3889-4de9-882b-37c2ef483b39	jasmine.dey20@example.com	$2b$10$599MHX.JNloyksICrGLXnOFJX43GVJK4bBG8kCRaLIAGCy5wtFdwa	Jasmine Dey	+880 017 29433596	customer	t	\N	\N	REFMJ6R1PY920	2024-10-12 13:12:09.097	2025-12-15 06:05:01.474	t	f	\N	\N	\N
abca15a8-b229-45b8-95b0-eac4a0b2e03a	salim.haque21@example.com	$2b$10$0lsZX/kB2/cQym9q1.cJguj0/9GLp2DMskhHLRvywkOyPifZn4Pt.	Salim Haque	+880 019 16576095	customer	t	\N	\N	REFMJ6R1Q0521	2025-04-29 10:20:07.059	2025-12-15 06:05:01.542	t	f	\N	\N	\N
9dc3e8c7-f09c-4f9e-90df-3150a6fb01ef	ali.paul22@example.com	$2b$10$6sSFNqVX2fBAEMmFzKTX3.8GU4S4AYIU3UHVPRy5RFIpGYoDlByYq	Ali Paul	+880 019 24333859	customer	t	\N	\N	REFMJ6R1Q2122	2024-11-04 03:23:55.809	2025-12-15 06:05:01.611	t	f	\N	\N	\N
16b1bc56-5776-462d-9d08-04f25e2d2bc2	rubel.mondal23@example.com	$2b$10$SrpCDAVPQKxpkRpSTrYeLOwbrVSaVq0ezcuE89UH8Ngqad2GR.Ysa	Rubel Mondal	+880 019 20967972	customer	t	\N	\N	REFMJ6R1Q4123	2025-11-15 01:05:21.687	2025-12-15 06:05:01.683	t	f	\N	\N	\N
4e8eef34-8718-4f23-a509-542ec8db53ee	rahman.ghosh24@example.com	$2b$10$ieA24RetdVWeYz2U8oz5z.115CNYoVRcUePEhN1pLx3an6Z1lxSle	Rahman Ghosh	+880 013 39611785	customer	t	\N	\N	REFMJ6R1Q5W24	2025-06-06 07:16:06.957	2025-12-15 06:05:01.75	t	f	\N	\N	\N
98b88282-3117-403f-9015-55008d48d6bb	rahim.mondal25@example.com	$2b$10$GwWtkwGBLZEnR.YnwmUEluVVfpjDFrmDXpi663o9HF9eDggUc8JyK	Rahim Mondal	+880 019 30821803	customer	t	\N	\N	REFMJ6R1Q7R25	2024-12-29 12:14:33.042	2025-12-15 06:05:01.817	t	f	\N	\N	\N
06a37035-0283-43f7-84b6-65763f0aa343	rubel.roy26@example.com	$2b$10$LQJb2vqM2RK5azepu.UCdukLwFmnQOJdrIxDDvQT2.220pyEfCGm2	Rubel Roy	+880 013 32865764	customer	t	\N	\N	REFMJ6R1Q9N26	2024-12-08 08:24:33.716	2025-12-15 06:05:01.885	t	f	\N	\N	\N
ef8869ce-6a88-477a-9d1a-89e5d2295e85	miah.talukdar27@example.com	$2b$10$Q08igbuesYVbLInVId2ib.w8kBhWp1OIvrtPKayYMGP0Eu3bU30fm	Miah Talukdar	+880 018 28021493	customer	t	\N	\N	REFMJ6R1QBF27	2025-06-12 18:25:19.733	2025-12-15 06:05:01.949	t	f	\N	\N	\N
6e81d257-7dbb-4fbe-931a-5da65f3afdf2	lima.karim28@example.com	$2b$10$qnC.Bd5fG0Je.Xe7vmRYfeN3QHxqljgW3TEjwS3H2sqbDcKR54LnS	Lima Karim	+880 016 31959412	customer	t	\N	\N	REFMJ6R1QDA28	2024-07-13 05:12:04.554	2025-12-15 06:05:02.016	t	f	\N	\N	\N
b437102f-173e-400c-8182-1618ec31c5b4	shathi.majumdar29@example.com	$2b$10$Y4pCCSuO25Pa6lxaGCNP.uouQu3npfeh7x4Uc/00ELQ5dEP4Iy5fG	Shathi Majumdar	+880 019 16454899	customer	t	\N	\N	REFMJ6R1QF629	2024-01-24 23:14:27.407	2025-12-15 06:05:02.083	t	f	\N	\N	\N
678e0979-cb77-4563-b7bc-9c129a01464d	nasir.haque30@example.com	$2b$10$c5SRFIL75yYYErf3QENyReoTCCp8yyXJEs1O1rjOIXNgXWqFINYsu	Nasir Haque	+880 016 83959301	customer	t	\N	\N	REFMJ6R1QH230	2024-09-24 00:32:29.56	2025-12-15 06:05:02.152	t	f	\N	\N	\N
85d0a95b-85f0-487e-b703-19fdc93dcffb	rani.pal31@example.com	$2b$10$oe4bSvtx3nOFYyOo/KTjNeZNNN0HJ0xwI31IkGyekQ8EGSJoFXPAa	Rani Pal	+880 015 42049879	customer	t	\N	\N	REFMJ6R1QIX31	2025-11-07 08:54:15.45	2025-12-15 06:05:02.219	t	f	\N	\N	\N
f89488e6-a248-43e3-9cc6-41ce7df2cb3c	kabir.miah32@example.com	$2b$10$A2mVfRxoRnjV6hlwWjUsfODLZbNByqiJol2JLsmVi8Lx.02GIjyy2	Kabir Miah	+880 017 33116952	customer	t	\N	\N	REFMJ6R1QKR32	2025-06-24 00:59:42.033	2025-12-15 06:05:02.285	t	f	\N	\N	\N
1f989822-2116-43c4-bbd8-3a808ef70271	khatun.sen33@example.com	$2b$10$0HWWkDm3zp5K3qUsyZVS1Omp.FxPWSk2K3qvJiAPR9uCIQK3hq5P.	Khatun Sen	+880 013 35074423	customer	t	\N	\N	REFMJ6R1QML33	2025-04-07 15:55:19.798	2025-12-15 06:05:02.351	t	f	\N	\N	\N
0eef5330-a8c8-4ace-a95d-94bbdfff9539	rubel.ali34@example.com	$2b$10$OcEabiE2BuJGZK5HfOL1ReyMHh24FftN4qiStw9fUzf.ep.i0jlUC	Rubel Ali	+880 019 84960280	customer	t	\N	\N	REFMJ6R1QOI34	2024-05-30 15:36:47.588	2025-12-15 06:05:02.42	t	f	\N	\N	\N
16f26372-9ced-4794-815b-0a0c18897215	jewel.chakraborty35@example.com	$2b$10$zci8nLEFnRpq5QIUBlv4huBe3JrIbw5D3UNxiFMFTZb4Fy3Kuwl5C	Jewel Chakraborty	+880 016 46212159	customer	t	\N	\N	REFMJ6R1QQH35	2025-09-09 00:51:35.268	2025-12-15 06:05:02.491	t	f	\N	\N	\N
81b767d6-e84f-4385-92bf-f15a916dde42	islam.rahman36@example.com	$2b$10$4k3/zKMG8YPH.trFLlWztujOsTtxphd.MTwI6ecphqyjoo3Qn5s7y	Islam Rahman	+880 013 57490411	customer	t	\N	\N	REFMJ6R1QSC36	2025-11-23 19:59:18.86	2025-12-15 06:05:02.558	t	f	\N	\N	\N
0e9e570a-f363-482e-a9a9-a71a6175e6b5	jamal.mondal37@example.com	$2b$10$1Kb.VBbjPAAWq6.BnVQBaeemgxWC24n4u/jfu.h9QFPHTQXY5JeJW	Jamal Mondal	+880 015 18794477	customer	t	\N	\N	REFMJ6R1QU737	2025-03-29 04:10:58.69	2025-12-15 06:05:02.625	t	f	\N	\N	\N
8870f26c-4761-4abc-ad9f-bebe0eb9abc6	hasan.sikder38@example.com	$2b$10$cclxhGwZATfYnWopri6ITOjXC1WJcXkdJv2kUXQvmQPMMMc2qFXSK	Hasan Sikder	+880 016 43438941	customer	t	\N	\N	REFMJ6R1QW838	2025-10-05 20:19:48.326	2025-12-15 06:05:02.698	t	f	\N	\N	\N
331f6371-7157-4cbd-ac01-fd62863bded1	begum.uddin39@example.com	$2b$10$eQ2zJTRvZamhpNEj/ue3velVBJrw8rfKqik3Q8K/soRf1TKeWBZq2	Begum Uddin	+880 017 61505221	customer	t	\N	\N	REFMJ6R1QY339	2025-02-11 00:49:44.355	2025-12-15 06:05:02.764	t	f	\N	\N	\N
5edb6f6c-c198-4062-8c94-7927101c9b73	nusrat.khan40@example.com	$2b$10$zdEs5EJUt/fSeGD7XtpX6O/GQoOuEYPRcxOo0g5RhnaFyGS1nk3KG	Nusrat Khan	+880 015 91572512	customer	t	\N	\N	REFMJ6R1QZY40	2024-09-05 01:34:17.211	2025-12-15 06:05:02.831	t	f	\N	\N	\N
8da64474-9e3c-4b25-92be-110755341c6e	nusrat.ali41@example.com	$2b$10$pll9k/rq2xBfgqXvcgZu5u08qI.2n2MGhRQOyfwKW82PEuZN.vNiS	Nusrat Ali	+880 019 60827470	customer	t	\N	\N	REFMJ6R1R1U41	2024-01-10 14:46:18.848	2025-12-15 06:05:02.9	t	f	\N	\N	\N
e0aa0e2a-de56-4aed-a518-8d504f5a0686	nila.choudhury42@example.com	$2b$10$06joxt.Kq7.t8GxRwGGtE.ypeseWGv41/BxBo2.69AfH687KTNgWO	Nila Choudhury	+880 016 98336292	customer	t	\N	\N	REFMJ6R1R3X42	2025-01-08 16:56:05.983	2025-12-15 06:05:02.975	t	f	\N	\N	\N
6b038fbe-c62b-4a14-a9c5-5fdc2a5fc660	mitu.pal43@example.com	$2b$10$PXRoaZM6wSvbauMwmHJy1.mSSfrECvkqbqSbHiSGva5YcEbU.wyZO	Mitu Pal	+880 015 97875858	customer	t	\N	\N	REFMJ6R1R5W43	2025-10-25 03:11:29.736	2025-12-15 06:05:03.046	t	f	\N	\N	\N
e32882e5-26ff-48b1-b420-3b6cabb6f991	fatima.sikder44@example.com	$2b$10$DJ7nYh6URI53btoecRQsI.1GYNWzpwPUzyKySSmDYGZD4tFIvO0bS	Fatima Sikder	+880 013 17525677	customer	t	\N	\N	REFMJ6R1R7W44	2024-08-27 23:06:34.814	2025-12-15 06:05:03.118	t	f	\N	\N	\N
7b570776-9d6c-4eab-8fc5-86aad69c4e5a	jewel.karim45@example.com	$2b$10$emsNHbAvPjA5Nm1Em7D3ieBAUMQZN9zXzTPxGvxmvd2ubLDgoAYqy	Jewel Karim	+880 013 44191030	customer	t	\N	\N	REFMJ6R1R9T45	2025-07-30 12:51:33.586	2025-12-15 06:05:03.188	t	f	\N	\N	\N
91861a95-0e9d-47ca-b8ff-4352d39f7556	fatima.barman46@example.com	$2b$10$eSNspYaPVYMzxXwt1AbaAuvKQAWvTb8Zbv2aE4decyfVUlJV7KtNO	Fatima Barman	+880 018 66158716	customer	t	\N	\N	REFMJ6R1RBU46	2024-08-10 05:27:27.115	2025-12-15 06:05:03.26	t	f	\N	\N	\N
39c99a8e-0d67-4067-993e-e4b360d395d3	tanvir.sen47@example.com	$2b$10$.AZeLioST31q.vET4.js1OICQ7ql5YNx/wj14CpSoqDMyhWh7p21W	Tanvir Sen	+880 018 55550315	customer	t	\N	\N	REFMJ6R1RDT47	2024-11-04 02:08:36.772	2025-12-15 06:05:03.331	t	f	\N	\N	\N
b0042245-e5bc-43e7-9dd2-17fe143ab2e1	kabir.biswas48@example.com	$2b$10$b.pfcnWQFbODk5GZspaeSuK63VnPXfXVOxQqbFp7RwRjnYM3UZcFG	Kabir Biswas	+880 016 57117607	customer	t	\N	\N	REFMJ6R1RFQ48	2024-11-23 01:22:13.102	2025-12-15 06:05:03.4	t	f	\N	\N	\N
88f7e15b-ce85-4d2c-89de-db2c2f013613	akter.sarkar49@example.com	$2b$10$Rqd63fXT6JsNBE6QQGFjc.vZaFpNP7GJPBhQKkOtqzPTGfPcDK8WG	Akter Sarkar	+880 013 55712713	customer	t	\N	\N	REFMJ6R1RHL49	2024-04-27 10:40:48.383	2025-12-15 06:05:03.467	t	f	\N	\N	\N
50c69e88-5a8b-4915-8b71-b60320160137	jahan.chowdhury50@example.com	$2b$10$YeLTGmqUdWSJEttvgIwv7.ddUYtO6nSi4TgbOBe23Q4BAn0c3tMLK	Jahan Chowdhury	+880 016 92194846	customer	t	\N	\N	REFMJ6R1RJF50	2025-05-07 21:41:45.967	2025-12-15 06:05:03.533	t	f	\N	\N	\N
9d5658af-2dbc-415e-9a8b-dad82ef995e2	razia.pal51@example.com	$2b$10$xHpob4.u5IsmnsuzbZt13e.3SN.NYv/RLYeABS/ntowLAArLsj0nW	Razia Pal	+880 019 35173676	customer	t	\N	\N	REFMJ6R1RLB51	2025-11-15 18:44:47.32	2025-12-15 06:05:03.601	t	f	\N	\N	\N
821b3860-ed14-40ba-a307-d405469c4c97	jamal.ali52@example.com	$2b$10$8zwktp3EgUStCq2QODvTl.KPcPqcdQ8gF1wbucKkv53h/DnC63V7e	Jamal Ali	+880 018 41814421	customer	t	\N	\N	REFMJ6R1RN752	2024-11-27 16:56:42.266	2025-12-15 06:05:03.669	t	f	\N	\N	\N
9d552a1a-e51e-4646-babd-19c254470db9	akter.uddin53@example.com	$2b$10$/nz3KcAJfRE/p88eZkH6L.uauVPOTlSzySM8aUXdiB68GMrhW22NG	Akter Uddin	+880 017 98480835	customer	t	\N	\N	REFMJ6R1RP353	2024-10-11 13:16:55.301	2025-12-15 06:05:03.737	t	f	\N	\N	\N
91809555-5cec-4a89-8c3d-dab2d8455e6e	shila.choudhury54@example.com	$2b$10$5I7SYxuOJOezaLnldd5hQOfMGn93UVHOgcJn.FJ4mz0eaP5BsNqLa	Shila Choudhury	+880 013 40663989	customer	t	\N	\N	REFMJ6R1RR254	2024-10-17 21:41:19.027	2025-12-15 06:05:03.808	t	f	\N	\N	\N
21c2e2aa-6798-4dd6-9293-69f8dda267bd	khatun.majumdar55@example.com	$2b$10$gvFoDIIoOly/.DfNWJKk1OALNTNJvj2BMkFAcrbGeW/gc0avGqRhG	Khatun Majumdar	+880 016 18158969	customer	t	\N	\N	REFMJ6R1RSZ55	2025-08-21 01:16:24.59	2025-12-15 06:05:03.877	t	f	\N	\N	\N
f1492d3b-2cdb-4745-ba96-c3ae6522363e	mamun.miah56@example.com	$2b$10$KrHX6CY/E.Gm78d7Yb3VQ.UsT.80MSGh36sDlm2uR1UfD1qrijeHG	Mamun Miah	+880 017 44726539	customer	t	\N	\N	REFMJ6R1RUT56	2024-03-30 20:10:06.743	2025-12-15 06:05:03.942	t	f	\N	\N	\N
ea49d1b9-7e02-424e-b154-559d3a094cca	salim.haque57@example.com	$2b$10$6S0sDiQdIsp1nGmLH.bN0.NvI0qUGYJxzvEhA3qO6POig5gLIp9gW	Salim Haque	+880 013 69451840	customer	t	\N	\N	REFMJ6R1RWP57	2025-05-28 20:21:41.339	2025-12-15 06:05:04.011	t	f	\N	\N	\N
28e7fe4b-7602-405a-b23b-5440c96cf2f6	mamun.choudhury58@example.com	$2b$10$boHBzuylVgL.LMmQgzoMW.Ffh5q1bN5Dhsc3Up0ss5Xe8ffpFaHKO	Mamun Choudhury	+880 016 42587093	customer	t	\N	\N	REFMJ6R1RYK58	2025-08-10 10:43:07.745	2025-12-15 06:05:04.078	t	f	\N	\N	\N
d80c524c-3cb6-4791-a232-c323e128db41	khatun.miah59@example.com	$2b$10$ILK9xzO/petZlrMpEgyD0uM4A8seAdfLgqbcZRfUAiPVnijvRWZ3W	Khatun Miah	+880 017 44059246	customer	t	\N	\N	REFMJ6R1S0G59	2024-05-26 17:04:36.786	2025-12-15 06:05:04.146	t	f	\N	\N	\N
0208b38f-243b-4eb4-a15a-adcf510eb6ab	islam.sheikh0@example.com	$2b$10$ayEppQke9OXA/2ORDS2bHOW9nzd9Z9YLJVmAhjU5QDHjr04EOxtju	Islam Sheikh	+880 019 12904420	customer	t	\N	\N	REFMJ6R4IBF0	2024-05-16 18:13:31.209	2025-12-15 06:07:11.548	t	f	\N	\N	\N
098098d1-efed-4325-9b8b-ab4eda7c95cf	shahana.pal1@example.com	$2b$10$ZceMFfXaiQMz1dy612Jel.UOnycHgk7H7bA67ng475C5ZcvdC0T/6	Shahana Pal	+880 013 26057590	customer	t	\N	\N	REFMJ6R4IDN1	2025-05-13 17:19:39.893	2025-12-15 06:07:11.628	t	f	\N	\N	\N
ce06c857-5d2f-4e0f-851a-8fb29d4a4e68	shanta.roy2@example.com	$2b$10$llmkeaZhhTIa6/Hn9YVklu/V3kAbnh/CdLtdJzTWq.hs2EU2b7cQS	Shanta Roy	+880 016 40950308	customer	t	\N	\N	REFMJ6R4IFR2	2025-05-06 14:06:17.17	2025-12-15 06:07:11.704	t	f	\N	\N	\N
f92e1c19-fb9d-4e9e-8663-17380ae426f5	rahim.roy3@example.com	$2b$10$J5o5dU5YoN9npLtpZ2BrSOwaMBRlANd9dQrADviygO5MSoCgxIDle	Rahim Roy	+880 019 34234241	customer	t	\N	\N	REFMJ6R4II03	2024-09-17 18:58:24.515	2025-12-15 06:07:11.785	t	f	\N	\N	\N
feaf05a6-a6e0-4433-ba1b-5c84b69b6319	rahim.khan4@example.com	$2b$10$NT6RjHFGLwBORgFH75vfsOcT6wOkAeo2EV4g60o8KhKNIcrUC7flC	Rahim Khan	+880 018 46429462	customer	t	\N	\N	REFMJ6R4IK74	2025-11-04 12:30:18.446	2025-12-15 06:07:11.865	t	f	\N	\N	\N
250716bd-ddd5-4b36-af2c-9b23e34e6de8	nasreen.khan5@example.com	$2b$10$jHjIl5q95L5aOmV9ObbtTOR9FyOkKIELwXmmH5BpzuwYe9FGoVoIm	Nasreen Khan	+880 013 59445300	customer	t	\N	\N	REFMJ6R4IM75	2025-03-07 01:34:55.767	2025-12-15 06:07:11.936	t	f	\N	\N	\N
0bb1ae57-0fa1-4bf5-bd55-0b3401009f9a	ayesha.sarkar6@example.com	$2b$10$jqTfmjABdp0d2fkBwxULheJAuZPyw2Ip.UXqTRyt7EP/bYHsvTC4e	Ayesha Sarkar	+880 019 34406364	customer	t	\N	\N	REFMJ6R4IOL6	2025-03-30 01:11:36.708	2025-12-15 06:07:12.022	t	f	\N	\N	\N
ee88e3f7-7054-40a2-9d23-21c945dc6474	ahmed.das7@example.com	$2b$10$UaBcC4OEbiWhiYxKFt0QMOU5pS12fEZBkQqwK7dp4TWLxP4oeKolC	Ahmed Das	+880 018 55333948	customer	t	\N	\N	REFMJ6R4IQI7	2024-06-20 16:32:34.825	2025-12-15 06:07:12.091	t	f	\N	\N	\N
0a5d3440-04ad-4ee5-8152-773d2d0c6e57	munni.islam8@example.com	$2b$10$9kjW/mKop7YVibtbPG2LBe4kO0hLXdBfrwbHH/jisuIjBlBm/oAJO	Munni Islam	+880 015 85148664	customer	t	\N	\N	REFMJ6R4ISI8	2025-11-19 07:12:18.85	2025-12-15 06:07:12.163	t	f	\N	\N	\N
359bfe60-8e7a-4faf-a491-a917962462ed	devi.mondal9@example.com	$2b$10$uxlOUdMSfh8YyKlPgvDjWO4qpCA8SHjB.W8t/iGF0XGjx71.6bYnG	Devi Mondal	+880 015 63155148	customer	t	\N	\N	REFMJ6R4IUE9	2024-04-15 07:47:36.006	2025-12-15 06:07:12.231	t	f	\N	\N	\N
499ac6f8-9edd-4e73-98aa-331ad236236d	sheikh.rahman10@example.com	$2b$10$BokbEN6k3Kt5wTytXNlGy.caNEIHtW/IB73Kr.tNhoEbR8Rn3NcG6	Sheikh Rahman	+880 019 58603893	customer	t	\N	\N	REFMJ6R4IWB10	2024-04-14 05:51:23.92	2025-12-15 06:07:12.299	t	f	\N	\N	\N
ee97c8e6-72be-45e4-90e8-2e677e2900ba	jamal.majumdar11@example.com	$2b$10$FHY0ylwcBHl9tid0mpv4cOXVgV8VzVrkP0TAJxqhk61hYdu240uCu	Jamal Majumdar	+880 016 88833725	customer	t	\N	\N	REFMJ6R4IY711	2024-08-09 19:28:29.303	2025-12-15 06:07:12.368	t	f	\N	\N	\N
67d2041c-f3a6-475c-b584-e99a8fb298bc	islam.ali12@example.com	$2b$10$M5YBXmZpNww9fQlI5W4nfugNP9LzagRdwjXI2LB1gDxNnTDQicnvq	Islam Ali	+880 015 49383693	customer	t	\N	\N	REFMJ6R4J0412	2025-03-16 23:29:28.203	2025-12-15 06:07:12.437	t	f	\N	\N	\N
b03284d2-218d-432b-a77d-f764bbfd304e	taslima.pal13@example.com	$2b$10$JWcAQpBDfvAIZl7JdcK2Iu3rCvkWb/UUBb35al6nkQPCt/wap/bqK	Taslima Pal	+880 013 66248028	customer	t	\N	\N	REFMJ6R4J2013	2024-01-20 19:07:36.811	2025-12-15 06:07:12.505	t	f	\N	\N	\N
8cbc54d9-a2ed-49da-ac2e-89b1f36bd971	shanta.sikder14@example.com	$2b$10$NGXJ64YVpeZKcUKi7d2us.IS8MK6Mj1ViVzPv0nvCF8VzWx5wmxyq	Shanta Sikder	+880 016 37529029	customer	t	\N	\N	REFMJ6R4J3U14	2024-10-06 14:36:43.658	2025-12-15 06:07:12.571	t	f	\N	\N	\N
b4078525-a9d1-49c9-a499-f5cdb35e4f79	chowdhury.sen15@example.com	$2b$10$xZe3.DGfnHYjn7ia/64MHOn/1TH2C4h/n5Xt5IlTFCOR/mLRBt7BG	Chowdhury Sen	+880 019 71529226	customer	t	\N	\N	REFMJ6R4J5S15	2025-09-02 00:22:55.335	2025-12-15 06:07:12.641	t	f	\N	\N	\N
f8d766c8-cae7-4adc-9fba-5b8ef4f490b6	tania.karim16@example.com	$2b$10$N4QRPCVcggPPe9S4Tdcuc.Unuov.KrTtbUnm1n8OQRaXvhQCCy5fa	Tania Karim	+880 017 41153668	customer	t	\N	\N	REFMJ6R4J7M16	2025-06-06 09:39:39.45	2025-12-15 06:07:12.707	t	f	\N	\N	\N
bd9c0e28-7e83-4d2f-b305-6ca753285863	lima.rahman17@example.com	$2b$10$qs.UvUItMExTFIQwEKr5ZeiUD/2RcxxBft5.PTMuOb41jupinMvK6	Lima Rahman	+880 015 48018096	customer	t	\N	\N	REFMJ6R4J9M17	2025-11-06 02:21:51.689	2025-12-15 06:07:12.779	t	f	\N	\N	\N
bcdfc058-552c-41ac-9e3a-41d69ef82889	islam.sen18@example.com	$2b$10$3sz.E0b3pIFYb3Yd5z/L0.hOs5PT0SJKVnuiaxZVnaku1RkgvPn2W	Islam Sen	+880 018 72335905	customer	t	\N	\N	REFMJ6R4JBK18	2024-01-08 12:18:36.629	2025-12-15 06:07:12.849	t	f	\N	\N	\N
3d5bf72b-356b-470a-9a55-3f9c3c65fc7e	begum.roy19@example.com	$2b$10$woDeqz167h4CHhiLVsAa3OEuvcAX3936uYkKp3pN3wVfnmDimXhK2	Begum Roy	+880 015 59915117	customer	t	\N	\N	REFMJ6R4JDD19	2024-02-18 03:14:10.285	2025-12-15 06:07:12.914	t	f	\N	\N	\N
656cf357-0996-48c4-b979-17548a9c8246	akter.ahmed20@example.com	$2b$10$PA8u6Yvu8TfVc7D0tMePt.PlAIMduVXksLNYmZTz1MRKIRuw2yZoO	Akter Ahmed	+880 017 99251664	customer	t	\N	\N	REFMJ6R4JFB20	2025-03-12 04:13:11.049	2025-12-15 06:07:12.984	t	f	\N	\N	\N
10db7aa7-f020-4330-859a-242c9e75ed0c	shathi.karim21@example.com	$2b$10$zKmVOsBu88uxDOOGhzbpWeNazUVJKJrx0RLbyoTHw8gneOHnm0MM2	Shathi Karim	+880 018 36662627	customer	t	\N	\N	REFMJ6R4JH721	2025-11-17 14:15:57.105	2025-12-15 06:07:13.052	t	f	\N	\N	\N
c9637d45-92f4-4ae3-af80-f268f3296743	kabir.sarkar22@example.com	$2b$10$FEKPNnhaPzXAcdGldv11O.WNLaP5oWG3PhLsnNRHADGx2fh2qwh02	Kabir Sarkar	+880 018 53111354	customer	t	\N	\N	REFMJ6R4JJ322	2025-10-06 13:06:07.657	2025-12-15 06:07:13.12	t	f	\N	\N	\N
a5744bb0-7620-4c95-80af-3827663949b0	rafiq.choudhury23@example.com	$2b$10$1EIxnVePX1HuMxCGrtnBkOsoeonsCuVyDDIFwt57Ni0Q6gwlDdmle	Rafiq Choudhury	+880 017 51815987	customer	t	\N	\N	REFMJ6R4JKX23	2024-10-02 12:51:30.005	2025-12-15 06:07:13.186	t	f	\N	\N	\N
ad536c6d-f828-40d8-ab36-6e15114c0ad5	parvin.choudhury24@example.com	$2b$10$bt7wpgZe10DWC0SIy2oIP.y.6fNalUrRQ9OzKTTBe9aYX0ReZBJa6	Parvin Choudhury	+880 018 52496821	customer	t	\N	\N	REFMJ6R4JMQ24	2025-05-21 06:54:44.835	2025-12-15 06:07:13.251	t	f	\N	\N	\N
1a2afc62-4e5b-40c4-be4f-9594bcd76ee8	farhan.miah25@example.com	$2b$10$FdPWOZYaFxEspmej9A5SIOSWz9KqnwYMdNwEToJsYkm58mqkycKHK	Farhan Miah	+880 019 40933392	customer	t	\N	\N	REFMJ6R4JOM25	2025-11-10 01:43:16.645	2025-12-15 06:07:13.319	t	f	\N	\N	\N
d179d185-7203-4900-92d4-38f0fb454eaa	mahfuz.sen26@example.com	$2b$10$jRm47GrYFZeqL.jFg1jdh.EktjqQ5ALwKON71C9yo76QjGmPds1B6	Mahfuz Sen	+880 019 35945607	customer	t	\N	\N	REFMJ6R4JQH26	2024-05-27 04:53:04.848	2025-12-15 06:07:13.386	t	f	\N	\N	\N
f580fd63-099a-444f-99d5-d3b84e2be8b7	mitu.sarkar27@example.com	$2b$10$6xWH6BurTQ8cnMKj.8ajruIvFJa91RaFJoF1GLiPT3QxOBFvT0EIS	Mitu Sarkar	+880 016 20686964	customer	t	\N	\N	REFMJ6R4JSD27	2024-03-11 07:00:45.671	2025-12-15 06:07:13.454	t	f	\N	\N	\N
a6fd7eda-f51f-4b4f-9910-ce468b563683	nasreen.paul28@example.com	$2b$10$4peZSPWOgTmD8voUfMnkmeqZI92Vf0Sd3ZEaPNa.RVxuaJUN.SUtq	Nasreen Paul	+880 017 42223979	customer	t	\N	\N	REFMJ6R4JUB28	2025-05-18 13:39:10.728	2025-12-15 06:07:13.524	t	f	\N	\N	\N
fe7d991e-6571-4f23-b408-a83ad731980f	karim.ali29@example.com	$2b$10$epPAbm7stJqBB6xb17CzjukDdlPFgSrM62Dd2u5pYBBmyIb.sbnnS	Karim Ali	+880 018 93741659	customer	t	\N	\N	REFMJ6R4JW629	2025-09-18 15:33:34.814	2025-12-15 06:07:13.591	t	f	\N	\N	\N
b70cbae3-e5bf-43ed-b6b9-0b8a121d44c7	polash.biswas30@example.com	$2b$10$iWfVg3k0QHlCrPYD..HEZ.D716EfYfMYKyns.yps3vlnSwAygUXfq	Polash Biswas	+880 019 24202644	customer	t	\N	\N	REFMJ6R4JY230	2025-05-03 10:16:34.072	2025-12-15 06:07:13.659	t	f	\N	\N	\N
8595976b-b062-4123-9de4-ad6e5d3c5f8f	polash.uddin31@example.com	$2b$10$28DbHZzw5Ru5BeJMywolp./m7hj4q47I6ZOy.zX3KGsUEJPkjPdtC	Polash Uddin	+880 019 23544291	customer	t	\N	\N	REFMJ6R4JZW31	2025-01-22 06:27:02.262	2025-12-15 06:07:13.725	t	f	\N	\N	\N
8de439ee-45c9-4c34-97b0-3929b3fc3751	nila.sen32@example.com	$2b$10$5x5Zp9mcEwoTNJAWp7zhi.dJ0WoC0TS5UqkQ6Xf9bJgr2uSmR53VS	Nila Sen	+880 019 34274843	customer	t	\N	\N	REFMJ6R4K1P32	2025-07-07 14:08:16.544	2025-12-15 06:07:13.79	t	f	\N	\N	\N
b94d4a6a-c619-4b42-8023-70ea6def0191	imran.ahmed33@example.com	$2b$10$tXnL4bG67CNg7L2ZNaP5cuUhY29ASzI/wLgNYswEgNMD6nrmdonGa	Imran Ahmed	+880 013 14185849	customer	t	\N	\N	REFMJ6R4K3L33	2024-02-17 02:32:37.224	2025-12-15 06:07:13.858	t	f	\N	\N	\N
b223f02e-fe45-4fd4-b85e-38a81efc0352	mahfuz.saha34@example.com	$2b$10$rfQXnxBts7YcyyjZtvtdD.rT3ek9YOuWQbTM9xxKrA5gDoHMT.56i	Mahfuz Saha	+880 016 16734759	customer	t	\N	\N	REFMJ6R4K5D34	2024-07-06 15:53:23.983	2025-12-15 06:07:13.922	t	f	\N	\N	\N
2f340d4c-b613-4b0e-b061-b042917b7fa8	islam.islam35@example.com	$2b$10$H9eTg0zKLFDFNWc92Ryrw.T1AZMAomZmNY7Cn.bSZ1ByIi0Wi5TwG	Islam Islam	+880 017 91083798	customer	t	\N	\N	REFMJ6R4K7635	2025-01-18 20:05:41.716	2025-12-15 06:07:13.987	t	f	\N	\N	\N
e7f1ff1c-00ab-48e5-88b6-5683c7aee694	mitu.pal36@example.com	$2b$10$7VAqfUsC/dNCtYe4cJlYweRUvvOr818fcKoJvPt2/O2N5X76nglt6	Mitu Pal	+880 019 79340511	customer	t	\N	\N	REFMJ6R4K9336	2025-11-19 09:54:46.096	2025-12-15 06:07:14.056	t	f	\N	\N	\N
0becbf6c-29c7-4fc0-a574-63147195f6d6	mamun.karim37@example.com	$2b$10$J9VplBkhN2NcBmpn.GEb9uR/fiw98wn5hdDo1BcE0ygKyRxmlqEzS	Mamun Karim	+880 015 77104539	customer	t	\N	\N	REFMJ6R4KB637	2025-01-22 17:05:44.504	2025-12-15 06:07:14.131	t	f	\N	\N	\N
8cc80208-a930-4a79-941c-4d7b274bba23	shakil.sikder38@example.com	$2b$10$og/Qp3RucVC//w4peblnA.Bi1vM85zV.IyogyA1F9XZHZS19gvYka	Shakil Sikder	+880 013 60267045	customer	t	\N	\N	REFMJ6R4KD138	2025-09-13 00:16:22.689	2025-12-15 06:07:14.199	t	f	\N	\N	\N
c9899f43-1363-42ee-8298-f205e86f7b6d	shila.ali39@example.com	$2b$10$jBJISHGhZd1Ura6ux6.Uyuu4He0KxhR.rKAMEH1n8qq6pV/Wfg.GK	Shila Ali	+880 017 21740219	customer	t	\N	\N	REFMJ6R4KF139	2025-01-23 14:13:51.496	2025-12-15 06:07:14.27	t	f	\N	\N	\N
19b0f63e-9095-44e8-a065-0df57b8552e0	parvin.talukdar40@example.com	$2b$10$7bHHWzY1anh/WtnJlhg6hezGYsJDi1R5Qo/j8mFC9WrU.fC0Hacm2	Parvin Talukdar	+880 017 25940323	customer	t	\N	\N	REFMJ6R4KH140	2025-09-17 10:35:10.247	2025-12-15 06:07:14.342	t	f	\N	\N	\N
726df130-935c-4df6-a670-8b6e2cbaa6e5	fatima.majumdar41@example.com	$2b$10$kjh2Y8p6GfFFtGbjqYoNG.7oX/TQWP8gUFp4YYYtAmPTAKmK8ag3q	Fatima Majumdar	+880 015 91714581	customer	t	\N	\N	REFMJ6R4KIW41	2025-02-21 06:36:01.761	2025-12-15 06:07:14.409	t	f	\N	\N	\N
95bf01d2-4894-44ea-a433-51757fcd312a	sabbir.sikder42@example.com	$2b$10$55ObbCsD5Towc/r9DkeYoe520iUN5J4BF1qOz3wGGY2k2eiOsiHjO	Sabbir Sikder	+880 016 76238120	customer	t	\N	\N	REFMJ6R4KKS42	2025-03-26 09:03:13.278	2025-12-15 06:07:14.477	t	f	\N	\N	\N
ad9d20cb-45e2-4b1a-897a-25bcebaecd91	rani.mondal43@example.com	$2b$10$Nca9F0uU.1BOF72oHCyzfeZAvbWHjo1bq8GiODfLYjtN3XCI9d9z6	Rani Mondal	+880 019 76134834	customer	t	\N	\N	REFMJ6R4KMP43	2024-02-18 21:08:32.41	2025-12-15 06:07:14.546	t	f	\N	\N	\N
3495e913-f6a6-4fea-97e2-9db6539b3cb0	moni.chowdhury44@example.com	$2b$10$BOSfApsjCHePhhEU.C56pOKXUrJkFIlatydS7BxDZL3LEj1qWheR2	Moni Chowdhury	+880 019 28167731	customer	t	\N	\N	REFMJ6R4KOL44	2025-03-09 07:36:07.94	2025-12-15 06:07:14.614	t	f	\N	\N	\N
78be32f0-60e4-433e-9c9f-3eb00aca0c15	shathi.islam45@example.com	$2b$10$eEY/DnMIYWKoHLI5.IFEZOkzNZsW89x8e45qgYZeRvp6UL5H/nipy	Shathi Islam	+880 017 25549983	customer	t	\N	\N	REFMJ6R4KQK45	2025-08-16 13:34:03.684	2025-12-15 06:07:14.684	t	f	\N	\N	\N
6d531e0d-2386-42bc-89fb-073e65971e71	ahmed.rahman46@example.com	$2b$10$UwMS6ajcmTkXdcv0djPs8.GY7ajvWAbjlzggBPXrrSOcu2f5bJw76	Ahmed Rahman	+880 015 64666137	customer	t	\N	\N	REFMJ6R4KSE46	2025-05-14 18:47:14.339	2025-12-15 06:07:14.751	t	f	\N	\N	\N
de5cf121-32a6-4770-adf3-0b557538198c	shathi.chowdhury47@example.com	$2b$10$h6qH8mQPuSgKF8.QABRpPehtxoM0zLoShezcE.NC2TI2mVhvIzCDa	Shathi Chowdhury	+880 019 84535657	customer	t	\N	\N	REFMJ6R4KUB47	2025-03-17 10:03:36.977	2025-12-15 06:07:14.82	t	f	\N	\N	\N
bce21961-f3d2-4669-a7fd-8fc87796d5aa	chowdhury.bhuiyan48@example.com	$2b$10$Em/nat8hDMGsZOjUvwxN2.kvx9ujQ7C4bRXkZExTuEa.eayn6yAs.	Chowdhury Bhuiyan	+880 015 92892610	customer	t	\N	\N	REFMJ6R4KWC48	2025-06-14 16:36:15.846	2025-12-15 06:07:14.893	t	f	\N	\N	\N
dc75a227-1451-4970-8c6e-dd1d8d642c39	imran.ahmed49@example.com	$2b$10$.9s7uk7b/1MBOKgI7/BqHe1bI4/poFFwoAyHInHQHtB0eQWHyB1sC	Imran Ahmed	+880 016 46981392	customer	t	\N	\N	REFMJ6R4KYC49	2024-10-15 20:50:12.243	2025-12-15 06:07:14.965	t	f	\N	\N	\N
1924006f-c962-45b9-b3a2-ec620b25f3c3	mitu.alam50@example.com	$2b$10$sJ/AerdOO7yjIC1yqXjxQ./xOxvV98ZWeAZu2vqYsEpbxgz8E09v6	Mitu Alam	+880 016 54486604	customer	t	\N	\N	REFMJ6R4L0950	2024-10-06 23:37:11.406	2025-12-15 06:07:15.033	t	f	\N	\N	\N
08ebf2f5-2360-4360-bc35-021aacff67c5	shathi.sarkar51@example.com	$2b$10$HPdPKMnHcl/vxrFQlmvDfOfPruYFT1CO7J4q6ttZNbSLIvOp6huTG	Shathi Sarkar	+880 015 12043121	customer	t	\N	\N	REFMJ6R4L2351	2024-08-27 19:46:50.595	2025-12-15 06:07:15.1	t	f	\N	\N	\N
ff3b521e-7cf8-4b1e-abc6-c4331f370335	sheikh.sikder52@example.com	$2b$10$55hf3KcoQaF5/gvdRFo5bOLjU.lPDoYzNAVk/d33dK0JrR8Caypv.	Sheikh Sikder	+880 015 24486320	customer	t	\N	\N	REFMJ6R4L3Z52	2025-03-11 19:50:35.244	2025-12-15 06:07:15.168	t	f	\N	\N	\N
b9556974-0605-4bda-9375-b4d60cae1b1b	ali.choudhury53@example.com	$2b$10$PuQUEsBvLJS0rH/wNLQOGuwqgSTD0DhxigKdoTo7fxolRRwOeP3Oi	Ali Choudhury	+880 018 35840272	customer	t	\N	\N	REFMJ6R4L5U53	2025-04-06 08:47:24.409	2025-12-15 06:07:15.235	t	f	\N	\N	\N
675afddc-5083-438c-9555-924372882c9f	nusrat.karim54@example.com	$2b$10$YlZPlfvic9T/LjnmCazuuORZQfzgCwnnPsHZ6uegG40D7P97csqjK	Nusrat Karim	+880 017 10612324	customer	t	\N	\N	REFMJ6R4L7P54	2024-07-01 06:24:32.233	2025-12-15 06:07:15.302	t	f	\N	\N	\N
144e45aa-b35d-42f9-907d-57ef361f0c20	rabeya.majumdar55@example.com	$2b$10$a0RDGFi9xKl46dpeCtaml.UAcxs4c.0FKATojHsAJ370ZfmjIqBHC	Rabeya Majumdar	+880 019 25148754	customer	t	\N	\N	REFMJ6R4L9M55	2025-12-03 09:29:43.436	2025-12-15 06:07:15.371	t	f	\N	\N	\N
9bd94bf0-50b5-46bf-a74b-decf9920aafd	chowdhury.islam56@example.com	$2b$10$47aTvJnZorFp.J21t1MzzOvMxMyUB4wyrmyzf0d76VRyUZbD4r9nK	Chowdhury Islam	+880 018 43810331	customer	t	\N	\N	REFMJ6R4LBI56	2024-03-23 07:07:45.449	2025-12-15 06:07:15.439	t	f	\N	\N	\N
0f6680fc-f156-4fbb-91a5-7315119925b5	razia.chakraborty57@example.com	$2b$10$IkcLXGPnPqH7NoNNl57PyOEw1mEFov6n/FTKU.z5S1M1m2ZEFJCQa	Razia Chakraborty	+880 016 25653248	customer	t	\N	\N	REFMJ6R4LDA57	2024-01-18 03:49:54.351	2025-12-15 06:07:15.503	t	f	\N	\N	\N
4868b96d-acaf-498a-9fb7-392f737f6ec5	tariq.ghosh58@example.com	$2b$10$3VNAt9nWXj6EcHe7KJAft.5xrQRJRtOs.kXKxsZ71aIDWei.hcelC	Tariq Ghosh	+880 015 27649327	customer	t	\N	\N	REFMJ6R4LF358	2024-12-04 09:26:18.908	2025-12-15 06:07:15.568	t	f	\N	\N	\N
610a5143-bb0d-40ab-9ca5-11f0bbc709e8	tania.uddin59@example.com	$2b$10$HOn9GFtDBPOVSof4Ch84jeUEnIosh0CZg3Rbzg1sEXRJ1YNClrMVi	Tania Uddin	+880 015 41361002	customer	t	\N	\N	REFMJ6R4LH159	2025-01-17 06:04:08.437	2025-12-15 06:07:15.637	t	f	\N	\N	\N
cacaf261-e176-466a-b124-70a34f628b21	sheikh.das0@example.com	$2b$10$5rVC.enCKk9YP/oKkAmlJ.oahvCDsp3uCevHRJkmyvlasot3COldC	Sheikh Das	+880 013 23748757	customer	t	\N	\N	REFMJ6R8OQE0	2025-10-17 22:52:01.064	2025-12-15 06:10:26.49	t	f	\N	\N	\N
7e96d919-6a3b-41c0-ac9b-d0340a808141	begum.majumdar1@example.com	$2b$10$lGI8zpB.xnQvqmHEkqEyfeODj0pyT6tw7V5XCdBCdCGzNz9lSolMu	Begum Majumdar	+880 015 33849720	customer	t	\N	\N	REFMJ6R8OSF1	2025-03-03 03:41:28.597	2025-12-15 06:10:26.562	t	f	\N	\N	\N
e1832547-c18d-4e59-97e8-6be90134f79f	mahfuz.choudhury2@example.com	$2b$10$Fz.blXLop8lcY8dHmoORWONoHkqtlcO1fQf51w29Sfz4nmLy3XugC	Mahfuz Choudhury	+880 019 66409430	customer	t	\N	\N	REFMJ6R8OU92	2025-06-02 02:02:33.139	2025-12-15 06:10:26.628	t	f	\N	\N	\N
ee55aa7e-d993-478b-9358-8ae92ab384e7	jahan.karim3@example.com	$2b$10$MDzmL07Vx76tXExiP4Ejf.XBoZ.EHCIIACbJlzvrnH55jw/qN69PC	Jahan Karim	+880 017 99517323	customer	t	\N	\N	REFMJ6R8OW43	2025-07-11 00:35:26.423	2025-12-15 06:10:26.696	t	f	\N	\N	\N
e02e823d-4c88-4e0e-ab2f-c3deaf5d5054	sheikh.sen4@example.com	$2b$10$TDjNpwHZPMhcR0OPjL.OQuKYFOBqv02ifAehKBq1LM6AiWawM775m	Sheikh Sen	+880 017 20352493	customer	t	\N	\N	REFMJ6R8OXZ4	2024-04-10 05:22:59.502	2025-12-15 06:10:26.762	t	f	\N	\N	\N
28dacd71-92c1-4fd9-b901-69d2f1c296d6	jahan.haque5@example.com	$2b$10$WcmWIyZOlYEoOb0YUHIZSeAAK5k8l2AalAGD8Qsx06iE/1iJelivi	Jahan Haque	+880 017 71508076	customer	t	\N	\N	REFMJ6R8P025	2024-03-09 20:07:15.756	2025-12-15 06:10:26.838	t	f	\N	\N	\N
a6384e8c-7ad0-4a2e-b7eb-54e60a4cfbb3	jahan.pal6@example.com	$2b$10$xDxRxB0LUbCQVWiMwpTDIeZgqIn1sJe5zNx8Du2ud3RalGlecc2mK	Jahan Pal	+880 013 47468655	customer	t	\N	\N	REFMJ6R8P1Z6	2024-01-13 03:28:44.46	2025-12-15 06:10:26.907	t	f	\N	\N	\N
6a283b81-620e-45b9-ab17-42f8fffcb506	jasmine.choudhury7@example.com	$2b$10$gzOvQuEpygGZDjnIb3FKK.jkiqgN7kXORPE/tTEBxjPgageEdOoXO	Jasmine Choudhury	+880 015 57008896	customer	t	\N	\N	REFMJ6R8P3W7	2025-08-11 21:44:44.545	2025-12-15 06:10:26.975	t	f	\N	\N	\N
d5fbfece-c5d0-4ebd-a38b-7cf6a1663129	moni.saha8@example.com	$2b$10$0ihJ.Z1pSisytIFxg0HbIOMyJsACMe8oyNLTKQnrGvMr9D5v7IX8i	Moni Saha	+880 017 90786208	customer	t	\N	\N	REFMJ6R8P608	2024-03-30 03:40:25.389	2025-12-15 06:10:27.051	t	f	\N	\N	\N
56c31414-1843-4b8d-aae4-27c7611065eb	moni.talukdar9@example.com	$2b$10$7X2V5GLfAz95kPY/pxiy9uXu7cFf/hpas4/dHtXLMepBGU9C4Y1Cq	Moni Talukdar	+880 013 79626004	customer	t	\N	\N	REFMJ6R8P809	2024-10-31 16:18:44.221	2025-12-15 06:10:27.124	t	f	\N	\N	\N
f377a912-8c9c-4adf-b3cc-eb82121dab35	moni.talukdar10@example.com	$2b$10$OyblvsCZGIzRuTLqUOdwMOMzE7W9TnQZCrizHT1Xg0Q5865UJRrVS	Moni Talukdar	+880 016 20835209	customer	t	\N	\N	REFMJ6R8P9Z10	2025-10-05 23:16:51.587	2025-12-15 06:10:27.195	t	f	\N	\N	\N
cfa9fc66-0b56-4ec9-acf5-3cf7a4812759	chowdhury.mondal11@example.com	$2b$10$kjKF3OndUpMAHDuf/NFPpeLStm9SXaCAfmxKO4F3Fdebx673QNzBO	Chowdhury Mondal	+880 016 83225123	customer	t	\N	\N	REFMJ6R8PBT11	2025-02-19 02:55:09.093	2025-12-15 06:10:27.261	t	f	\N	\N	\N
e5fbc866-4eca-41dc-9170-9a4b75b13dc5	poly.khan12@example.com	$2b$10$aPMeKUXz0.rRVGHfj7gs0O2W9MO/MJ7/hyOekqadPCsRDTGV4cL6q	Poly Khan	+880 017 76758487	customer	t	\N	\N	REFMJ6R8PDW12	2024-08-17 23:06:14.82	2025-12-15 06:10:27.336	t	f	\N	\N	\N
7dc14a69-9111-4b03-977f-9c9be475ba65	nasreen.biswas13@example.com	$2b$10$ALbgR0ACqhHhqaR6whwWoOLpNMnJpcsEO5i4XhOXyikI3ULye/y8u	Nasreen Biswas	+880 013 40920762	customer	t	\N	\N	REFMJ6R8PFU13	2025-03-16 14:18:37.3	2025-12-15 06:10:27.405	t	f	\N	\N	\N
b78a9765-a80d-4663-8022-3ad40cbcba50	karim.alam14@example.com	$2b$10$oVBKqG4CNhX4PTS/0xKiBeh/4AZhUPOyq3la18BEy1Hc2adXWhuXu	Karim Alam	+880 013 11873986	customer	t	\N	\N	REFMJ6R8PHM14	2025-10-03 15:18:23.576	2025-12-15 06:10:27.469	t	f	\N	\N	\N
ca037ea4-c593-4b5e-aaff-3c24498903b0	mahfuz.majumdar15@example.com	$2b$10$RkS0N3OlrBWP.DeEVX0NFuvyXhr2BGPYug3uIi8d8nnyECZGTTIE2	Mahfuz Majumdar	+880 015 46173979	customer	t	\N	\N	REFMJ6R8PJL15	2024-01-03 09:29:29.957	2025-12-15 06:10:27.541	t	f	\N	\N	\N
e4c057d8-f0b9-43ab-97b3-ef17bee43d49	rony.rahman16@example.com	$2b$10$3TpdQfY8F5uL23WDmqszD.9oxKwszRw3o8ABLbma/IvDyqA7KcNgC	Rony Rahman	+880 015 29017169	customer	t	\N	\N	REFMJ6R8PLJ16	2025-10-21 15:02:54.362	2025-12-15 06:10:27.611	t	f	\N	\N	\N
915b3c32-a9e6-4bcb-b07b-0826d85d510c	keya.saha17@example.com	$2b$10$zsfgDkVBJsEpwrtATMJWceG//sQ./RGa959tQ9yFuYpK37teuWEPy	Keya Saha	+880 017 75911736	customer	t	\N	\N	REFMJ6R8PNF17	2025-10-30 04:34:21.387	2025-12-15 06:10:27.679	t	f	\N	\N	\N
16155352-550a-45b2-9e21-aecaf077b9a1	khan.dey18@example.com	$2b$10$59fk5enUdnn8mUYJbgshge35RGPhSX5FvjB/j/UoC4vq7.gTMRIuW	Khan Dey	+880 015 55074595	customer	t	\N	\N	REFMJ6R8PPE18	2025-05-27 22:24:02.206	2025-12-15 06:10:27.749	t	f	\N	\N	\N
c8e9be52-22c7-49c9-b0e9-713a511d1b85	rabeya.pal19@example.com	$2b$10$jTx5C8b0eCVI6UjK7mkrAeapWHWu0c9pBJ5YS2410JTiJYHFlCqYS	Rabeya Pal	+880 019 76457627	customer	t	\N	\N	REFMJ6R8PRA19	2024-03-30 07:02:49.97	2025-12-15 06:10:27.817	t	f	\N	\N	\N
584dbc44-045e-48bb-acae-16bea65e12da	rubel.chakraborty20@example.com	$2b$10$NVCpIC.IyTbnbVDp2Xi3vOtqgHpmH6ylJMQN4NKqUA9omtG3PyfNK	Rubel Chakraborty	+880 015 45732884	customer	t	\N	\N	REFMJ6R8PT620	2024-01-22 05:21:05.263	2025-12-15 06:10:27.885	t	f	\N	\N	\N
28d856f9-b873-4b7b-81fc-f60796d119be	rani.karim21@example.com	$2b$10$zLHYqbdXARpo8eMSpnLgcOiV1EZl.NSMZ7qWuCywQjrSvLo4liiOS	Rani Karim	+880 016 72161266	customer	t	\N	\N	REFMJ6R8PV221	2024-01-27 19:28:25.829	2025-12-15 06:10:27.954	t	f	\N	\N	\N
0180a727-6bb9-4124-b41e-6d1d857416c3	bibi.sen22@example.com	$2b$10$ajQl6YqxUduHyv7xhxWRz.f8Z7VjwQuQBpetPCESyslgvmXF6tmqC	Bibi Sen	+880 013 44133064	customer	t	\N	\N	REFMJ6R8PWX22	2024-10-22 18:40:38.638	2025-12-15 06:10:28.021	t	f	\N	\N	\N
3acbf882-3c3a-49ad-8803-c04505c0b393	jewel.majumdar23@example.com	$2b$10$SLCrxsaB7kB7bjh3GwXaTue/Vt7.J/eVNTCcudZkAwhe5inJ/1BDe	Jewel Majumdar	+880 016 34002582	customer	t	\N	\N	REFMJ6R8PYR23	2024-05-19 07:39:31.348	2025-12-15 06:10:28.087	t	f	\N	\N	\N
99514db7-a4f9-4e28-bfd5-9702f79158ee	nusrat.haque24@example.com	$2b$10$MigC3ZZ9.2T1tV1CYEKclOsbOTnN.xcCOJ9mcbY9eQt1DhXlggOBC	Nusrat Haque	+880 016 69099328	customer	t	\N	\N	REFMJ6R8Q0L24	2024-10-19 14:08:48.334	2025-12-15 06:10:28.152	t	f	\N	\N	\N
f2f145ce-c50c-4494-bbe0-76f32c161afb	rafiq.sen25@example.com	$2b$10$lYGLM7nIG0XsbLifhF0tbOX4n1t0r/ITz3CqExMmO0ZNKCOt.vRDW	Rafiq Sen	+880 017 73133142	customer	t	\N	\N	REFMJ6R8Q2F25	2025-07-05 15:56:25.556	2025-12-15 06:10:28.219	t	f	\N	\N	\N
53c4a37d-1fa1-4a0f-acb3-4d7130be38eb	khan.sen26@example.com	$2b$10$TO8FoZHLPQ4Qy.MPmsz97etTR8uIghKTMAtKGiPL1AGw.mU4UkCLG	Khan Sen	+880 018 46251860	customer	t	\N	\N	REFMJ6R8Q4D26	2024-05-30 11:25:20.555	2025-12-15 06:10:28.289	t	f	\N	\N	\N
555cb39b-a563-405a-bb2c-a05273d13d55	khatun.alam27@example.com	$2b$10$R/hFMaDEioWmUVKateaPUOnL8a3waYhCmnchPb0YpHjlNjUQSxL/i	Khatun Alam	+880 017 38817379	customer	t	\N	\N	REFMJ6R8Q6D27	2025-01-30 04:04:50.028	2025-12-15 06:10:28.361	t	f	\N	\N	\N
4ba17e91-dd7e-45c6-b250-90d80a45f64e	tanvir.rahman28@example.com	$2b$10$AXEtAvFbxQ4Lt1dtNMWmFeZFa24fgTsw7WCTG4l6q3wV/HsDZxCWO	Tanvir Rahman	+880 017 72902189	customer	t	\N	\N	REFMJ6R8Q8A28	2024-12-07 17:13:57.469	2025-12-15 06:10:28.43	t	f	\N	\N	\N
2b8f954b-6350-401e-b9a6-d5219f4d52e5	ritu.paul29@example.com	$2b$10$9xHPpwPi1KNYTIqmysnsX.fsdwXctEsxLl4hrX3j3qdxSSe9KKNAC	Ritu Paul	+880 017 48300692	customer	t	\N	\N	REFMJ6R8QA729	2025-05-06 08:29:56.756	2025-12-15 06:10:28.499	t	f	\N	\N	\N
44461494-4417-431e-bf80-16aea20e0d43	farhan.ghosh30@example.com	$2b$10$4vOmu7dGtvDbvaGQMXiD6.eEiJdiEF2V0Qo8hG8.dUiVubCAsSUnu	Farhan Ghosh	+880 015 51069656	customer	t	\N	\N	REFMJ6R8QD730	2024-05-02 21:32:08.728	2025-12-15 06:10:28.607	t	f	\N	\N	\N
f0f8374e-53d2-4073-8601-f54045a4524c	jamal.ghosh31@example.com	$2b$10$OQe.X4Ouq3J5NMkBy1HmWuXLx4JFdjPZ9t.PAi6Rf73rN3.Lu.Fnq	Jamal Ghosh	+880 013 76649723	customer	t	\N	\N	REFMJ6R8QFT31	2025-04-16 01:25:46.948	2025-12-15 06:10:28.701	t	f	\N	\N	\N
87591ff3-bae8-43cf-86a2-c04dec93e2b1	ali.paul32@example.com	$2b$10$/NlCZKM0uWv7UajYCtNZYuCET6hYQnSWRvPTewVh/4pMchEim7ma2	Ali Paul	+880 018 30338290	customer	t	\N	\N	REFMJ6R8QHU32	2024-09-28 01:04:18.375	2025-12-15 06:10:28.773	t	f	\N	\N	\N
e55c6eed-8ba6-4d99-9730-bd9b1e46f6f3	rahman.chowdhury33@example.com	$2b$10$mQwEphupwoA.jyh.6z2UL.MJdElJz4xaP6BEahQzdyEcNeDIu.TVG	Rahman Chowdhury	+880 015 72619361	customer	t	\N	\N	REFMJ6R8QJQ33	2024-10-12 08:58:24.538	2025-12-15 06:10:28.842	t	f	\N	\N	\N
f22b04f8-469a-4efb-a3ea-4336e9afcdd7	farhan.majumdar34@example.com	$2b$10$qypcyh9m5pQ1rSjMA5QBIOnuL3.wqLtrZafzYQ.7Q3A0tIQNwHk2i	Farhan Majumdar	+880 019 27117529	customer	t	\N	\N	REFMJ6R8QLK34	2024-06-29 18:34:37.616	2025-12-15 06:10:28.907	t	f	\N	\N	\N
ec002b65-e66b-4d0b-b5cc-98dcf26b1c5a	jamal.ahmed35@example.com	$2b$10$H3O3y7Npc/6nj4qzR5ylw.woDHLwAfhdMpDk0XIjPqo2WiT7QtbAa	Jamal Ahmed	+880 013 62935851	customer	t	\N	\N	REFMJ6R8QNH35	2025-04-06 20:00:26.749	2025-12-15 06:10:28.976	t	f	\N	\N	\N
d686de62-1f55-49a3-9853-83a6b72372d0	shanta.talukdar36@example.com	$2b$10$8Sv0o8CKDpFBVCMXZXAHI.Yd31Bop/iRVgzjTRtp/KtrURhNVT4HW	Shanta Talukdar	+880 016 95945241	customer	t	\N	\N	REFMJ6R8QPH36	2024-11-14 20:15:48.71	2025-12-15 06:10:29.049	t	f	\N	\N	\N
8ba62327-c287-4507-8d09-4a2e7c5c3114	jewel.chakraborty37@example.com	$2b$10$oa70V.Cu6iBXiZpO3l8ht.dIIC3/GLc8RCvyuI9sIuvJ.O0QXNW1y	Jewel Chakraborty	+880 013 83986512	customer	t	\N	\N	REFMJ6R8QRD37	2024-07-03 20:27:42.106	2025-12-15 06:10:29.116	t	f	\N	\N	\N
d180319f-4acd-4d4d-81c2-e508dc85f3ae	shahana.sarkar38@example.com	$2b$10$GAQCbiHx0erhnPTQm/AwvuUwewo9t55x/HAj5fiyeMAlDjKoMSKGS	Shahana Sarkar	+880 013 30233244	customer	t	\N	\N	REFMJ6R8QT638	2024-06-21 10:27:14.681	2025-12-15 06:10:29.182	t	f	\N	\N	\N
13e0124c-701f-4bd5-ad96-5624c881eb4a	ali.pal39@example.com	$2b$10$4OpuiwK7LYxNg8sMCksf0uTbiQtCUBLJdlxkz0TLMcDXn0A5g2vwm	Ali Pal	+880 017 22927034	customer	t	\N	\N	REFMJ6R8QV239	2024-04-04 11:06:32.641	2025-12-15 06:10:29.25	t	f	\N	\N	\N
e7213d99-5513-49b2-aadb-79b5ba99c89b	jamal.bhuiyan40@example.com	$2b$10$pgX7e6XOVoFLjWeQvn8P4exqX.Wl1YV2f27BGcaVjhCaXg3fhFjXK	Jamal Bhuiyan	+880 017 90490937	customer	t	\N	\N	REFMJ6R8QWY40	2024-11-08 13:46:21.656	2025-12-15 06:10:29.318	t	f	\N	\N	\N
fd91b1f8-72d3-4ec7-af08-b1c9c3ce0f54	fatima.roy41@example.com	$2b$10$/YFNik4/GiRt9lIUa42cs.uSTzEp41rMG8mFte7NnNe1G1oUY5mha	Fatima Roy	+880 015 85292579	customer	t	\N	\N	REFMJ6R8QYX41	2024-12-30 02:50:23.599	2025-12-15 06:10:29.388	t	f	\N	\N	\N
354532ce-c20c-4fea-8fa7-fb1f5197872e	mamun.chowdhury42@example.com	$2b$10$kvPJMXS7dxJvhLFRBT2OxuKQUctqVmyFitwBNxii0r8hvJIGvPxb6	Mamun Chowdhury	+880 019 19645514	customer	t	\N	\N	REFMJ6R8R0Y42	2025-06-21 19:31:19.559	2025-12-15 06:10:29.462	t	f	\N	\N	\N
cdb4055a-0b51-4671-af3f-38139c53f41d	moni.ghosh43@example.com	$2b$10$Ej5GkkkLtGjGC79Q5oWNz.2qlKIxc5R.Q0NyAQn9BlcPdNFOTFIRa	Moni Ghosh	+880 016 66917803	customer	t	\N	\N	REFMJ6R8R2T43	2024-03-27 21:46:21.979	2025-12-15 06:10:29.529	t	f	\N	\N	\N
98b23ded-b7b9-405c-982c-e67a2c93225d	chowdhury.paul44@example.com	$2b$10$FHx.hgnGOEm4DPo3urpntOaGIaRtpA6yUdhys5UOhb0BMN.XiNsd6	Chowdhury Paul	+880 013 23231350	customer	t	\N	\N	REFMJ6R8R4S44	2025-08-20 02:49:00.426	2025-12-15 06:10:29.6	t	f	\N	\N	\N
90d7a5ab-766b-48bc-9627-d6162c134e4e	salim.saha45@example.com	$2b$10$r9/z7b2wXBIdwlYTz9K27uAA6GgGzVLo12hUtoZRnZHRnegOal4T6	Salim Saha	+880 016 90472629	customer	t	\N	\N	REFMJ6R8R6W45	2025-09-11 17:32:33.591	2025-12-15 06:10:29.676	t	f	\N	\N	\N
36ec23f0-0bfa-4cb8-9c98-b2d8cfe8d628	khatun.chakraborty46@example.com	$2b$10$IDwCJD3d/ntyyKPbuYGWmeZVkIb3sHHVXUlsTHI.a1LxTgyITpAMe	Khatun Chakraborty	+880 017 74661889	customer	t	\N	\N	REFMJ6R8R8S46	2024-03-08 12:24:21.378	2025-12-15 06:10:29.744	t	f	\N	\N	\N
0e21d655-491d-4d38-a91b-d10090e7c56e	shakil.barman47@example.com	$2b$10$BDA7bacwDtAjDvGJJ2nNdecdfZsfPx4GYoc7YHUECndh467OwiCxy	Shakil Barman	+880 018 93883978	customer	t	\N	\N	REFMJ6R8RAL47	2024-02-05 03:35:07.449	2025-12-15 06:10:29.809	t	f	\N	\N	\N
e6ccd072-7e45-456a-8a7b-498383e0c0a9	polash.ali48@example.com	$2b$10$RZi4rH0Hl2yeqClAZkANvu1XVZp2axYfBtKsrRQ57uTrRPytcMqqC	Polash Ali	+880 015 89751272	customer	t	\N	\N	REFMJ6R8RCH48	2024-04-28 02:28:38.398	2025-12-15 06:10:29.876	t	f	\N	\N	\N
faa35b83-c487-4cb7-9ba7-1de33d8400af	parvin.barman49@example.com	$2b$10$nGxIDgnL9mBp5jEX8JC89.QGyK6EriacLOjAsdfVgPsr5ZTPPZnW2	Parvin Barman	+880 019 21814967	customer	t	\N	\N	REFMJ6R8REA49	2024-07-18 12:00:40.921	2025-12-15 06:10:29.941	t	f	\N	\N	\N
e571f4ba-47d8-4d1b-9162-af8c3716225b	mamun.chowdhury50@example.com	$2b$10$MUv8wYAedS1YhiJxRgAGD.ikXUM4rHs391/k0GDwudvc5i5T4pbk6	Mamun Chowdhury	+880 017 76708322	customer	t	\N	\N	REFMJ6R8RG850	2025-06-01 21:59:46.096	2025-12-15 06:10:30.011	t	f	\N	\N	\N
614ed139-693c-43e3-85ea-f5f517114acd	nasir.barman51@example.com	$2b$10$DYcwk8llPQNENCNTmXpRhe9FKCyZH4wr70f2AKX9dTZlkRVINea5G	Nasir Barman	+880 015 41104367	customer	t	\N	\N	REFMJ6R8RI651	2025-05-18 11:19:48.87	2025-12-15 06:10:30.082	t	f	\N	\N	\N
2199f365-a3d2-44d4-9e64-6358e781f963	rabeya.paul52@example.com	$2b$10$zwcLtQu/twu4U/BDVJUTfOlie4Z5UcCODWREnxAJnmlR7to4mbo9W	Rabeya Paul	+880 019 48190828	customer	t	\N	\N	REFMJ6R8RK652	2024-05-03 15:09:42.194	2025-12-15 06:10:30.153	t	f	\N	\N	\N
e1b51326-0d97-499e-b601-dd1ee3a075c2	islam.chowdhury53@example.com	$2b$10$Rl7ayV/pfdIH9F/27M3CC.QqTCcbgweVjX55ILlty7zMdWGDLZZja	Islam Chowdhury	+880 016 16915880	customer	t	\N	\N	REFMJ6R8RM253	2024-10-22 08:55:40.276	2025-12-15 06:10:30.222	t	f	\N	\N	\N
69afbf86-1ba6-4d32-b705-3f12389b0ef0	karim.talukdar54@example.com	$2b$10$L0dYa3q2wZ63dulk9M0YgOlgvAHhCScSzIoYkLJDhQ9/F76Lonr9i	Karim Talukdar	+880 015 96474668	customer	t	\N	\N	REFMJ6R8RNX54	2024-01-10 19:13:20.714	2025-12-15 06:10:30.289	t	f	\N	\N	\N
36e077cc-60e3-43a8-9510-d764a373f907	rubel.talukdar55@example.com	$2b$10$.JzcoD.BlIRmW3AKXrPUh.7GtszLuW1kNcKoF0EBJq8Kk3Ro0hKGi	Rubel Talukdar	+880 018 27292409	customer	t	\N	\N	REFMJ6R8RPU55	2024-12-11 09:35:43.562	2025-12-15 06:10:30.357	t	f	\N	\N	\N
fe1f1873-9525-4c12-abeb-81edd7cda7cf	chowdhury.khan56@example.com	$2b$10$XpOTxzziSVuO6/ylQ3Dg0uYSDKUTSUXhH/hD9V12V82/jlus//OfO	Chowdhury Khan	+880 016 34335508	customer	t	\N	\N	REFMJ6R8RRT56	2025-07-17 14:46:07.359	2025-12-15 06:10:30.428	t	f	\N	\N	\N
2a996bda-5066-4dae-87b2-e916834d8cd6	salim.pal57@example.com	$2b$10$YjxlsOOWjT79p4LL1FO9PuQD1kHCtIzcHaE7R9s3.lIQvFn92aWCW	Salim Pal	+880 013 33060089	customer	t	\N	\N	REFMJ6R8RTT57	2024-02-09 20:56:05.074	2025-12-15 06:10:30.501	t	f	\N	\N	\N
10a419f6-88c4-425e-89cd-a6eee1f0fb67	moni.uddin58@example.com	$2b$10$2a0oYfnY9dac1GjfllyZne24DkSXH.qk78ibv.Ap1y1ejUCBvrK1.	Moni Uddin	+880 018 30632659	customer	t	\N	\N	REFMJ6R8RVR58	2024-10-02 04:22:19.562	2025-12-15 06:10:30.57	t	f	\N	\N	\N
2c8af084-30e7-447f-9f92-350f9f9d06d5	nasir.saha59@example.com	$2b$10$GvOGTRudqqEl4GKxB4y1yeSkA8K0RV7RYkJK3rfl3ubArVXPz7SWG	Nasir Saha	+880 018 69118295	customer	t	\N	\N	REFMJ6R8RXN59	2025-01-25 04:53:01.695	2025-12-15 06:10:30.638	t	f	\N	\N	\N
8f1ab731-ef5f-4393-bea0-0ae0f46c03bd	xyzc11756@gmail.com	$2b$10$I7AelWKdhsz13tMZGptiouIitOu9.0Lv7oo38cBSeUyeW4zR.wIiK	kawshik Karmakar	+8801991523333	customer	t	\N	\N	\N	2025-12-15 10:53:21.064	2025-12-15 10:53:55.671	t	f	\N	\N	\N
\.


--
-- Data for Name: VerificationCode; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."VerificationCode" (id, code, type, "userId", email, phone, "expiresAt", used, attempts, "createdAt") FROM stdin;
7e8070a7-2ac0-493b-9bae-c3ca0c9a25ea	664800	email_verify	a2fc95cb-21e1-4752-8ff7-3c119af7a111	sanim7004@gmail.com	\N	2025-12-15 05:26:48.847	f	0	2025-12-15 05:16:48.849
bb9cd215-68cf-4bed-be56-4ab94acaf101	507136	email_verify	8f1ab731-ef5f-4393-bea0-0ae0f46c03bd	xyzc11756@gmail.com	\N	2025-12-15 11:03:21.078	t	1	2025-12-15 10:53:21.079
\.


--
-- Data for Name: Wishlist; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Wishlist" (id, "userId", "productId", "shareToken", "isPublic", "createdAt") FROM stdin;
\.


--
-- Name: Address Address_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_pkey" PRIMARY KEY (id);


--
-- Name: AnnouncementDismissal AnnouncementDismissal_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AnnouncementDismissal"
    ADD CONSTRAINT "AnnouncementDismissal_pkey" PRIMARY KEY (id);


--
-- Name: Announcement Announcement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Announcement"
    ADD CONSTRAINT "Announcement_pkey" PRIMARY KEY (id);


--
-- Name: CartItem CartItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_pkey" PRIMARY KEY (id);


--
-- Name: Cart Cart_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: ChatMessage ChatMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_pkey" PRIMARY KEY (id);


--
-- Name: ChatRestriction ChatRestriction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChatRestriction"
    ADD CONSTRAINT "ChatRestriction_pkey" PRIMARY KEY (id);


--
-- Name: ChatSession ChatSession_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChatSession"
    ADD CONSTRAINT "ChatSession_pkey" PRIMARY KEY (id);


--
-- Name: ContactMessage ContactMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContactMessage"
    ADD CONSTRAINT "ContactMessage_pkey" PRIMARY KEY (id);


--
-- Name: Coupon Coupon_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Coupon"
    ADD CONSTRAINT "Coupon_pkey" PRIMARY KEY (id);


--
-- Name: FlashSaleProduct FlashSaleProduct_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FlashSaleProduct"
    ADD CONSTRAINT "FlashSaleProduct_pkey" PRIMARY KEY (id);


--
-- Name: FlashSale FlashSale_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FlashSale"
    ADD CONSTRAINT "FlashSale_pkey" PRIMARY KEY (id);


--
-- Name: InventoryLog InventoryLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InventoryLog"
    ADD CONSTRAINT "InventoryLog_pkey" PRIMARY KEY (id);


--
-- Name: LoyaltyPoints LoyaltyPoints_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LoyaltyPoints"
    ADD CONSTRAINT "LoyaltyPoints_pkey" PRIMARY KEY (id);


--
-- Name: LoyaltySettings LoyaltySettings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LoyaltySettings"
    ADD CONSTRAINT "LoyaltySettings_pkey" PRIMARY KEY (id);


--
-- Name: LoyaltyTier LoyaltyTier_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LoyaltyTier"
    ADD CONSTRAINT "LoyaltyTier_pkey" PRIMARY KEY (id);


--
-- Name: NewsletterSubscriber NewsletterSubscriber_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NewsletterSubscriber"
    ADD CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY (id);


--
-- Name: NewsletterSubscription NewsletterSubscription_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NewsletterSubscription"
    ADD CONSTRAINT "NewsletterSubscription_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: PointsTransaction PointsTransaction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PointsTransaction"
    ADD CONSTRAINT "PointsTransaction_pkey" PRIMARY KEY (id);


--
-- Name: ProductAnswer ProductAnswer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductAnswer"
    ADD CONSTRAINT "ProductAnswer_pkey" PRIMARY KEY (id);


--
-- Name: ProductComparison ProductComparison_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductComparison"
    ADD CONSTRAINT "ProductComparison_pkey" PRIMARY KEY (id);


--
-- Name: ProductQuestion ProductQuestion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductQuestion"
    ADD CONSTRAINT "ProductQuestion_pkey" PRIMARY KEY (id);


--
-- Name: ProductVariant ProductVariant_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductVariant"
    ADD CONSTRAINT "ProductVariant_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: Referral Referral_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Referral"
    ADD CONSTRAINT "Referral_pkey" PRIMARY KEY (id);


--
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- Name: SiteSettings SiteSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SiteSettings"
    ADD CONSTRAINT "SiteSettings_pkey" PRIMARY KEY (id);


--
-- Name: Testimonial Testimonial_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Testimonial"
    ADD CONSTRAINT "Testimonial_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: VerificationCode VerificationCode_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VerificationCode"
    ADD CONSTRAINT "VerificationCode_pkey" PRIMARY KEY (id);


--
-- Name: Wishlist Wishlist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Wishlist"
    ADD CONSTRAINT "Wishlist_pkey" PRIMARY KEY (id);


--
-- Name: AnnouncementDismissal_announcementId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AnnouncementDismissal_announcementId_idx" ON public."AnnouncementDismissal" USING btree ("announcementId");


--
-- Name: AnnouncementDismissal_announcementId_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "AnnouncementDismissal_announcementId_userId_key" ON public."AnnouncementDismissal" USING btree ("announcementId", "userId");


--
-- Name: AnnouncementDismissal_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AnnouncementDismissal_userId_idx" ON public."AnnouncementDismissal" USING btree ("userId");


--
-- Name: Cart_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Cart_userId_key" ON public."Cart" USING btree ("userId");


--
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- Name: ChatRestriction_sessionId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ChatRestriction_sessionId_key" ON public."ChatRestriction" USING btree ("sessionId");


--
-- Name: ChatSession_sessionId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ChatSession_sessionId_key" ON public."ChatSession" USING btree ("sessionId");


--
-- Name: ContactMessage_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContactMessage_createdAt_idx" ON public."ContactMessage" USING btree ("createdAt");


--
-- Name: ContactMessage_isRead_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContactMessage_isRead_idx" ON public."ContactMessage" USING btree ("isRead");


--
-- Name: Coupon_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Coupon_code_key" ON public."Coupon" USING btree (code);


--
-- Name: FlashSaleProduct_flashSaleId_productId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "FlashSaleProduct_flashSaleId_productId_key" ON public."FlashSaleProduct" USING btree ("flashSaleId", "productId");


--
-- Name: InventoryLog_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "InventoryLog_createdAt_idx" ON public."InventoryLog" USING btree ("createdAt");


--
-- Name: InventoryLog_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "InventoryLog_productId_idx" ON public."InventoryLog" USING btree ("productId");


--
-- Name: LoyaltyPoints_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "LoyaltyPoints_userId_key" ON public."LoyaltyPoints" USING btree ("userId");


--
-- Name: LoyaltyTier_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "LoyaltyTier_name_key" ON public."LoyaltyTier" USING btree (name);


--
-- Name: NewsletterSubscriber_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON public."NewsletterSubscriber" USING btree (email);


--
-- Name: NewsletterSubscription_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "NewsletterSubscription_email_key" ON public."NewsletterSubscription" USING btree (email);


--
-- Name: Order_orderNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Order_orderNumber_key" ON public."Order" USING btree ("orderNumber");


--
-- Name: Payment_orderId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Payment_orderId_key" ON public."Payment" USING btree ("orderId");


--
-- Name: Payment_transactionId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Payment_transactionId_key" ON public."Payment" USING btree ("transactionId");


--
-- Name: PointsTransaction_loyaltyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PointsTransaction_loyaltyId_idx" ON public."PointsTransaction" USING btree ("loyaltyId");


--
-- Name: PointsTransaction_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PointsTransaction_userId_idx" ON public."PointsTransaction" USING btree ("userId");


--
-- Name: ProductVariant_sku_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ProductVariant_sku_key" ON public."ProductVariant" USING btree (sku);


--
-- Name: Product_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Product_slug_key" ON public."Product" USING btree (slug);


--
-- Name: Referral_referralCode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Referral_referralCode_idx" ON public."Referral" USING btree ("referralCode");


--
-- Name: Referral_referredId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Referral_referredId_key" ON public."Referral" USING btree ("referredId");


--
-- Name: Referral_referrerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Referral_referrerId_idx" ON public."Referral" USING btree ("referrerId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_googleId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_googleId_key" ON public."User" USING btree ("googleId");


--
-- Name: User_referralCode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_referralCode_key" ON public."User" USING btree ("referralCode");


--
-- Name: User_verificationToken_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_verificationToken_key" ON public."User" USING btree ("verificationToken");


--
-- Name: VerificationCode_code_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "VerificationCode_code_type_idx" ON public."VerificationCode" USING btree (code, type);


--
-- Name: VerificationCode_email_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "VerificationCode_email_type_idx" ON public."VerificationCode" USING btree (email, type);


--
-- Name: Wishlist_shareToken_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Wishlist_shareToken_key" ON public."Wishlist" USING btree ("shareToken");


--
-- Name: Wishlist_userId_productId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Wishlist_userId_productId_key" ON public."Wishlist" USING btree ("userId", "productId");


--
-- Name: Address Address_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AnnouncementDismissal AnnouncementDismissal_announcementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AnnouncementDismissal"
    ADD CONSTRAINT "AnnouncementDismissal_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES public."Announcement"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CartItem CartItem_cartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES public."Cart"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CartItem CartItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Cart Cart_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Category Category_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ChatMessage ChatMessage_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public."ChatSession"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FlashSaleProduct FlashSaleProduct_flashSaleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FlashSaleProduct"
    ADD CONSTRAINT "FlashSaleProduct_flashSaleId_fkey" FOREIGN KEY ("flashSaleId") REFERENCES public."FlashSale"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FlashSaleProduct FlashSaleProduct_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FlashSaleProduct"
    ADD CONSTRAINT "FlashSaleProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LoyaltyPoints LoyaltyPoints_tierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LoyaltyPoints"
    ADD CONSTRAINT "LoyaltyPoints_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES public."LoyaltyTier"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: LoyaltyPoints LoyaltyPoints_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LoyaltyPoints"
    ADD CONSTRAINT "LoyaltyPoints_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_addressId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES public."Address"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Payment Payment_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PointsTransaction PointsTransaction_loyaltyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PointsTransaction"
    ADD CONSTRAINT "PointsTransaction_loyaltyId_fkey" FOREIGN KEY ("loyaltyId") REFERENCES public."LoyaltyPoints"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PointsTransaction PointsTransaction_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PointsTransaction"
    ADD CONSTRAINT "PointsTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductAnswer ProductAnswer_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductAnswer"
    ADD CONSTRAINT "ProductAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."ProductQuestion"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductAnswer ProductAnswer_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductAnswer"
    ADD CONSTRAINT "ProductAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductQuestion ProductQuestion_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductQuestion"
    ADD CONSTRAINT "ProductQuestion_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductQuestion ProductQuestion_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductQuestion"
    ADD CONSTRAINT "ProductQuestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductVariant ProductVariant_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductVariant"
    ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Referral Referral_referredId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Referral"
    ADD CONSTRAINT "Referral_referredId_fkey" FOREIGN KEY ("referredId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Referral Referral_referrerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Referral"
    ADD CONSTRAINT "Referral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Wishlist Wishlist_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Wishlist"
    ADD CONSTRAINT "Wishlist_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Wishlist Wishlist_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Wishlist"
    ADD CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 3Uxa2sCd63MgfGcwz5OvVnacpNjrb3Whu1Tcjlb0SxGdwFjVKrqRlT8LgzTmq0J

