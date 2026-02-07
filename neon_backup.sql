--
-- PostgreSQL database dump
--

\restrict GTPduLanIgMe3vqUzWDPFXMJzdy90J6iJf3cwACmfDbor7avapZViGxfzXwnLse

-- Dumped from database version 17.7 (bdd1736)
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
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "autoApply" boolean DEFAULT false NOT NULL,
    "targetAudience" text DEFAULT 'all'::text NOT NULL
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
-- Name: InternalMessage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."InternalMessage" (
    id text NOT NULL,
    "senderId" text NOT NULL,
    "receiverId" text NOT NULL,
    content text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
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
    "tierId" text,
    "totalPoints" integer DEFAULT 0 NOT NULL,
    "lifetimePoints" integer DEFAULT 0 NOT NULL,
    "lifetimeSpent" double precision DEFAULT 0 NOT NULL,
    "redeemedPoints" integer DEFAULT 0 NOT NULL,
    "tierUpdatedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
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
    name text,
    phone text,
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
    "verificationCode" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
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
-- Name: PayoutRequest; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PayoutRequest" (
    id text NOT NULL,
    "userId" text NOT NULL,
    amount double precision NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    method text NOT NULL,
    details text NOT NULL,
    "adminNote" text,
    "processedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: PointsTransaction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PointsTransaction" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "loyaltyId" text NOT NULL,
    type text NOT NULL,
    points integer NOT NULL,
    description text NOT NULL,
    "orderId" text,
    "expiresAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
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
    "sellerId" text,
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
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "shopId" text
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
    "referredId" text NOT NULL,
    "referralCode" text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "referrerBonus" integer DEFAULT 0 NOT NULL,
    "referredBonus" integer DEFAULT 0 NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: RefundRequest; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RefundRequest" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "userId" text NOT NULL,
    amount double precision NOT NULL,
    reason text NOT NULL,
    images text,
    status text DEFAULT 'pending'::text NOT NULL,
    "adminNote" text,
    "processedAt" timestamp(3) without time zone,
    "processedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
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
    photos text,
    "isApproved" boolean DEFAULT false NOT NULL,
    "adminReply" text,
    "adminReplyAt" timestamp(3) without time zone,
    "adminReplyBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SellerApplication; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SellerApplication" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "shopName" text NOT NULL,
    "shopDescription" text,
    category text,
    "nidNumber" text,
    "nidImage" text,
    "passportNumber" text,
    "passportImage" text,
    "bankName" text,
    status text DEFAULT 'pending'::text NOT NULL,
    "rejectionReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "accountName" text,
    "accountNumber" text,
    "bkashNumber" text,
    "nagadNumber" text,
    "routingNumber" text
);


--
-- Name: Shop; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Shop" (
    id text NOT NULL,
    "ownerId" text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    logo text,
    banner text,
    phone text,
    email text,
    address text,
    city text,
    "isVerified" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    rating double precision DEFAULT 0 NOT NULL,
    "totalSales" integer DEFAULT 0 NOT NULL,
    "totalProducts" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SiteSetting; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SiteSetting" (
    id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SiteSettings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SiteSettings" (
    id text DEFAULT 'main'::text NOT NULL,
    "storeName" text DEFAULT 'CTG Collection'::text NOT NULL,
    "storeTagline" text DEFAULT 'Premium E-Commerce Store'::text NOT NULL,
    "storeDescription" text,
    "storeEmail" text DEFAULT 'support@ctgcollection.com'::text NOT NULL,
    email2 text,
    "storePhone" text DEFAULT '+880 1234 567890'::text NOT NULL,
    phone2 text,
    "storeAddress" text DEFAULT 'Chittagong, Bangladesh'::text NOT NULL,
    "addressLine2" text,
    "workingDays" text DEFAULT 'Sat - Thu'::text NOT NULL,
    "workingHours" text DEFAULT '9AM - 9PM'::text NOT NULL,
    "offDays" text DEFAULT 'Friday: 3PM - 9PM'::text NOT NULL,
    facebook text,
    instagram text,
    twitter text,
    youtube text,
    linkedin text,
    whatsapp text,
    "aboutTitle" text DEFAULT 'About CTG Collection'::text NOT NULL,
    "aboutContent" text,
    "aboutMission" text,
    "aboutVision" text,
    "footerAbout" text,
    "copyrightText" text DEFAULT '© 2024 CTG Collection. All rights reserved.'::text NOT NULL,
    "metaTitle" text,
    "metaDescription" text,
    "metaKeywords" text,
    "googleMapsEmbed" text,
    "chatStatus" text DEFAULT 'online'::text NOT NULL,
    "promoEnabled" boolean DEFAULT true NOT NULL,
    "promoCode" text DEFAULT 'WELCOME10'::text NOT NULL,
    "promoMessage" text DEFAULT '🎉 Use code WELCOME10 for 10% OFF'::text NOT NULL,
    "promoEndTime" timestamp(3) without time zone,
    "shippingCost" double precision DEFAULT 60 NOT NULL,
    "freeShippingMin" double precision DEFAULT 2000 NOT NULL,
    "codEnabled" boolean DEFAULT true NOT NULL,
    "sslEnabled" boolean DEFAULT true NOT NULL,
    "pointsPerTaka" double precision DEFAULT 0.01 NOT NULL,
    "pointsValue" double precision DEFAULT 0.1 NOT NULL,
    "unifiedLogin" boolean DEFAULT true NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "bkashEnabled" boolean DEFAULT true NOT NULL,
    "bkashNumber" text DEFAULT '01991523289'::text NOT NULL,
    "multiVendorEnabled" boolean DEFAULT false NOT NULL,
    "nagadEnabled" boolean DEFAULT true NOT NULL,
    "nagadNumber" text DEFAULT '01991523289'::text NOT NULL,
    "rocketEnabled" boolean DEFAULT true NOT NULL,
    "rocketNumber" text DEFAULT '01991523289'::text NOT NULL,
    "couponCostPolicy" text DEFAULT 'platform'::text NOT NULL,
    "defaultCommission" double precision DEFAULT 5.0 NOT NULL,
    "spinWheelConfig" jsonb,
    logo text,
    "stat1Label" text DEFAULT 'Products Sold'::text NOT NULL,
    "stat1Value" text DEFAULT '10,000+'::text NOT NULL,
    "stat2Label" text DEFAULT 'Happy Customers'::text NOT NULL,
    "stat2Value" text DEFAULT '5,000+'::text NOT NULL,
    "stat3Label" text DEFAULT 'Brands'::text NOT NULL,
    "stat3Value" text DEFAULT '100+'::text NOT NULL,
    "stat4Label" text DEFAULT 'Average Rating'::text NOT NULL,
    "stat4Value" text DEFAULT '4.8'::text NOT NULL,
    "value1Desc" text DEFAULT 'We carefully select every product to ensure the highest quality standards.'::text NOT NULL,
    "value1Title" text DEFAULT 'Quality First'::text NOT NULL,
    "value2Desc" text DEFAULT 'Nationwide delivery within 2-5 business days.'::text NOT NULL,
    "value2Title" text DEFAULT 'Fast Delivery'::text NOT NULL,
    "value3Desc" text DEFAULT 'Our customers are at the heart of everything we do.'::text NOT NULL,
    "value3Title" text DEFAULT 'Customer Love'::text NOT NULL,
    "value4Desc" text DEFAULT 'Proudly serving Bangladesh with the best local and international products.'::text NOT NULL,
    "value4Title" text DEFAULT 'Local Pride'::text NOT NULL,
    "returnsEnabled" boolean DEFAULT true NOT NULL,
    "featureAuthenticDesc" text DEFAULT 'Genuine products'::text NOT NULL,
    "featureAuthenticTitle" text DEFAULT '100% Authentic'::text NOT NULL,
    "featureCODDesc" text DEFAULT 'Cash on Delivery'::text NOT NULL,
    "featureCODTitle" text DEFAULT 'COD Available'::text NOT NULL,
    "featureReturnDesc" text DEFAULT '7-day return policy'::text NOT NULL,
    "featureReturnTitle" text DEFAULT 'Easy Returns'::text NOT NULL,
    "featureShippingDesc" text DEFAULT 'Orders over BDT 2,000'::text NOT NULL,
    "featureShippingTitle" text DEFAULT 'Free Shipping'::text NOT NULL,
    "showAuthentic" boolean DEFAULT true NOT NULL,
    "showCOD" boolean DEFAULT true NOT NULL,
    "showEasyReturns" boolean DEFAULT true NOT NULL,
    "showFreeShipping" boolean DEFAULT true NOT NULL
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
    "emailVerified" boolean DEFAULT false NOT NULL,
    "verificationToken" text,
    "verificationExpiry" timestamp(3) without time zone,
    "twoFactorEnabled" boolean DEFAULT false NOT NULL,
    "twoFactorMethod" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    permissions text[] DEFAULT ARRAY[]::text[]
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
a8fdab2f-dcb8-4bdf-bee1-7aafb4a09e5d	6a36964a-528e-47b9-9fab-58af0c6e7419	\N	John Doe	+8801812345678	123 Main Street, Apartment 4B	Chittagong	Chittagong	4000	t	2025-12-20 17:08:40.071	2025-12-20 17:08:40.071
779e7619-085c-4468-9951-fef2091d04cc	4657508a-a0fd-433b-87f8-9fd906b61ddf	\N	shohrab hossain	01626241911	Hahajsnsnsnsna	Ahahaha	Dhaka	626262	f	2026-01-29 13:47:43.943	2026-01-29 13:47:43.943
4da4ccdb-c467-46cf-879f-16e75fd64c9b	4657508a-a0fd-433b-87f8-9fd906b61ddf	\N	shohrab hossain	01626241911	Hahajsnsnsnsna	Ahahaha	Dhaka	626262	f	2026-01-29 14:14:11.828	2026-01-29 14:14:11.828
e3078855-a944-45c3-98ae-d137b7545d0b	591ddf6b-acf5-4e79-b069-a31a1ea7879d	\N	Sanim Ahmed	01991523289	halishahar,chittagong	Chittagong	Gaibandha	4216	f	2026-02-05 06:24:43.941	2026-02-05 06:24:43.941
781ca86b-c348-48e7-8773-922fcf5ed813	591ddf6b-acf5-4e79-b069-a31a1ea7879d	\N	Sanim Ahmed	01991523289	halishahar,chittagong	Chittagong	Bagerhat	4216	f	2026-02-05 06:27:07.411	2026-02-05 06:27:07.411
\.


--
-- Data for Name: Announcement; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Announcement" (id, title, content, type, priority, "targetAudience", "isActive", "startDate", "endDate", "createdBy", "createdAt", "updatedAt") FROM stdin;
9c71dff2-6557-496d-ac91-f6b4912b6375	WELCOME TO OUR PLATFORM CTG COLLECTION 	WE HAVE ALL KIND OF SYSTEM READY FOR YOUR SHOP . SO PLEASE TELL US REVIEW AND YOUR NEEDS IN MESSAGE FROM CONTACT OR MAILS !!	info	10	all	t	2025-12-19 19:58:00	\N	e710fee5-2414-4515-a420-a601e95d2e48	2025-12-19 19:59:47.052	2025-12-19 19:59:47.052
\.


--
-- Data for Name: AnnouncementDismissal; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AnnouncementDismissal" (id, "announcementId", "userId", "sessionId", "dismissedAt") FROM stdin;
27a4d0f6-92cc-4792-833c-685bafe2f26c	9c71dff2-6557-496d-ac91-f6b4912b6375	93512fb3-25b3-46f4-8c76-2d2eb8d40b3b	\N	2025-12-19 20:00:09.415
1b39144f-e5be-4531-a602-a073337e23f9	9c71dff2-6557-496d-ac91-f6b4912b6375	e710fee5-2414-4515-a420-a601e95d2e48	\N	2025-12-19 20:45:18.57
655877b9-5638-42e6-902b-053d4271be36	9c71dff2-6557-496d-ac91-f6b4912b6375	59a22c3c-1d30-4c60-ab37-764a2088541b	\N	2025-12-19 20:51:14.152
039b3fe5-53ed-41b2-8c44-c9b803012f7b	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	mdro3	2025-12-20 13:49:52.875
2c954359-3692-4473-882d-102660a5acad	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	hbzj2p	2025-12-20 17:04:55.621
593dfa99-9a24-4696-b796-1ae42e246635	9c71dff2-6557-496d-ac91-f6b4912b6375	46b004a6-98a3-4fcb-9474-3f45da7f83dc	\N	2025-12-20 17:05:29.922
d3396154-3f5f-4112-91c3-020f6afbded4	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	o8fnsf	2025-12-20 17:12:29.399
584253b6-8084-4c01-b70e-f69f7393dc3c	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	dudqo	2025-12-20 17:31:19.208
7afb913f-cd90-4fc9-8be4-42a663cffdca	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	dudqo	2025-12-20 17:31:19.609
016dacef-2c46-457a-bc93-dc1f72be75d0	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	zyujoh	2025-12-20 17:51:27.787
2f068e03-9356-4233-bc71-d4de530d4e4f	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	jqn4er	2025-12-20 17:53:05.048
7d6430a6-af09-4dc7-b8bb-4c38c02c9df3	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	w2kko	2025-12-20 18:05:27.075
0358edbc-4db9-478c-97fa-ee0f675304dd	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	w2kko	2025-12-20 18:05:27.403
1114e02d-0835-463e-a193-c6fd5e055997	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	ziupke	2025-12-20 18:46:55.919
53de8a63-9a2a-45c7-af83-188a7257485d	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	mln0gq	2025-12-20 19:50:58.923
2d1db1d4-57e1-4bd3-825a-f3c9278727e1	9c71dff2-6557-496d-ac91-f6b4912b6375	591ddf6b-acf5-4e79-b069-a31a1ea7879d	\N	2025-12-20 19:54:41.79
97c61388-acdc-46bf-91fb-aa3c6854b015	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	l0unbu	2025-12-20 20:44:03.497
d3ef51cf-83b4-43e5-8b9b-1807892dfb7d	9c71dff2-6557-496d-ac91-f6b4912b6375	22e6c85f-944c-48a7-bd73-e8583810d66a	\N	2025-12-20 20:44:21.882
8f775092-7191-416a-aa7e-ff04606378bf	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	l49at	2025-12-20 23:06:50.043
d10e68cd-c7e0-4440-9e27-8b0523a8482f	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	l49at	2025-12-20 23:06:50.495
e9d8ab3d-696a-4891-b8ef-643a4ff62b9d	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	d2354s	2025-12-24 14:50:15.917
c603fc00-9dc5-4d2f-8d87-4804a6a2b9d5	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	mtadkf	2025-12-24 14:51:25.454
9f742b64-4cbe-4627-b3bc-4935eebceb69	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	y24st7	2025-12-26 18:58:03.687
1956e766-07b1-479c-96f3-f55f61fbb37d	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	lkmjz	2026-01-03 05:36:42.682
7edad518-66b1-45d6-92af-1f35539e8705	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	aaxkr	2026-01-03 12:35:51.273
b94a772f-dfc2-40f0-8db3-e124b0c76b15	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	k0vn6	2026-01-11 07:38:25.091
2663d40e-2101-4572-88ca-09bd3fdc5e33	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	xr8tfo	2026-01-15 13:36:17.184
065e87dd-f997-4de1-9e29-9acb4e960c66	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	czyuuj	2026-01-15 13:36:36.169
b77b88b3-8fac-4df6-883d-46c7457734d2	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	k1grwd	2026-01-15 13:36:57.271
8553f72e-2d03-498c-acb9-78de5699db69	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	sh4eux	2026-01-22 04:38:36.237
a52ca687-217b-4f61-8588-9671ac23277c	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	tvov6	2026-01-23 05:01:29.767
c1f53eaf-c44f-468f-9d11-2e8f6f47dd30	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	8w6i3j	2026-01-23 05:02:42.871
38071408-f363-49ce-ac2c-4c1c0fe4e384	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	indcij	2026-01-23 05:04:28.502
91bdcb11-1902-4ebb-a670-531d23389b63	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	rqljg4	2026-01-23 05:09:26.836
77cdcd40-790f-4fde-a7a3-29c1726d2917	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	w86to4	2026-01-23 05:10:17.646
f8abdf30-18cb-422a-8b10-50d6136bd857	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	u8uyywn	2026-01-23 05:10:47.232
2c299d16-2981-4e73-8821-c1e26901d977	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	up0fx8	2026-01-23 05:13:03.482
7355640d-88a4-4b82-b253-c49f85659f9e	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	b5ursf	2026-01-23 05:14:21.505
ed96804c-420a-4877-bb38-2fb28a83e54d	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	qs4jk	2026-01-23 05:31:02.156
ce780268-a38a-420c-8015-c7600553c6a9	9c71dff2-6557-496d-ac91-f6b4912b6375	43fae45e-5412-4a09-9b7a-13d4621f9fe8	\N	2026-01-24 13:32:57.298
2eb60f65-0f9e-4671-9cd2-74d240fd01c2	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	pfyerv	2026-01-26 12:16:45.877
129bc969-0476-4071-9dab-d947e59f617f	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	bnx2cl	2026-01-29 13:17:34.23
28f4210b-7531-4f30-8511-14bd5290221f	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	gd1vel	2026-01-29 13:31:41.119
ad2d04c4-a768-42dd-b0c4-8815b1359e16	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	08iqt	2026-01-29 13:43:53.781
9d95fee4-60e8-4120-bfc1-1db29502d600	9c71dff2-6557-496d-ac91-f6b4912b6375	4657508a-a0fd-433b-87f8-9fd906b61ddf	\N	2026-01-29 13:44:12.695
5df473a8-92e5-4280-b151-6955aa246436	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	wwsmur	2026-01-30 10:29:14.895
975f4656-c3dc-41f6-8522-c716c8f50999	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	uppru	2026-01-30 10:29:21.919
30baeec3-cef1-4810-93e6-fd54b14662f7	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	uppru	2026-01-30 10:29:22.012
8681501f-dec7-491b-a983-d616d276bf15	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	q3dq9k	2026-01-30 10:31:01.76
17c14e88-168b-4710-b24f-af7d82cb71a8	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	hwsute	2026-01-31 17:39:39.733
a7c8b87e-199b-4f73-b12d-239a2bde8d64	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	vrscr4	2026-02-05 02:04:43.395
8c26117a-6754-48f4-bd91-637deb987d86	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	lwtucd	2026-02-05 08:43:42.212
262428a0-eace-4ed6-83af-8166700c0d44	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	rn6gl	2026-02-05 08:56:01.537
ea4a2a55-d781-41bb-b327-4bc7cc32bd74	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	vr4fg	2026-02-05 09:02:11.6
bf8ca0be-0d3b-461f-98f1-8d4b8b3f1cbc	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	ws23xp	2026-02-05 09:14:07.625
1bdbce14-33cd-4ba2-a339-1addd9343ba0	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	rpxuyn	2026-02-05 09:20:18.454
e7128f4c-4a27-4ea2-aa21-d3cb03dd35d6	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	1w8ys	2026-02-05 09:26:56.238
e0c92f13-e11d-480f-b3e1-afadaed1798d	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	eyrl64	2026-02-05 09:27:52.97
42eb62af-6ed0-4721-bad9-3ac5a855d6f1	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	fgzgcq	2026-02-05 09:30:50.38
80ea7361-c674-42f8-9f05-b2fbda78f48a	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	pbr62p	2026-02-05 09:31:13.887
57b22354-0659-44b7-af8d-c83475179b9c	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	c6x1qio	2026-02-05 09:34:38.761
e33949a6-f5a9-4d60-ad33-b1c3f7a9561e	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	pj4ofl	2026-02-05 09:49:56.277
b31923ed-9352-489c-b9d5-581bfe33275a	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	pj4ofl	2026-02-05 09:49:56.766
e9c810bf-659f-4b71-93fa-83b7ed470b05	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	ulasv	2026-02-05 10:09:34.472
94a5705e-2194-4236-a551-94583010e3a6	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	ulasv	2026-02-05 10:09:34.772
fe899bcd-d857-4807-b79f-1d382018dcc3	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	wilfzs	2026-02-05 10:15:40.148
295f8df1-d54d-41c2-a1e9-f6b1fc0ce3b7	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	mdpjyt	2026-02-05 10:15:59.58
b5a8c144-126f-4a09-a631-af77a9254143	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	9vcl0n	2026-02-05 10:16:24.571
6c990407-4f05-4abd-9059-72cf8191611c	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	bnvf1e	2026-02-05 10:20:44.481
7af3201b-3c94-4e2c-8e10-da3f5d98c601	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	62k19	2026-02-05 10:31:07.852
9bb1ab97-5521-44df-abab-5326746d2267	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	5srx2	2026-02-05 13:42:14.711
a8896f4d-5205-46ea-abd7-07ed9da21e11	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	9yf6tf	2026-02-06 11:58:56.022
6132b3ac-c3e2-438e-a27a-f084dc6f931f	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	ttqear	2026-02-06 11:59:16.899
2358e5c9-1106-4bdd-ba5d-ab02ed188d89	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	e7a9zf	2026-02-06 11:59:35.01
049b6c88-1bcf-4c2d-8b2b-e77875f06bb3	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	99qm7b	2026-02-06 11:59:47.62
06fdad19-c665-40cf-b5a4-97195c469fc9	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	3i5vt9	2026-02-06 12:09:35.829
761b5675-64c1-4590-aa3e-ad40e722a268	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	38konf	2026-02-06 12:16:30.696
34eda045-14d0-4bc6-bf75-4ca532819dde	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	x6r0sg	2026-02-06 15:10:47.784
02741d4f-5096-4cdb-a294-cf1cab8e7ab1	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	ebg1z6	2026-02-07 06:29:00.695
f053d937-2d6f-4192-80fe-71e58f680248	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	u2fbi	2026-02-07 06:29:45.007
2a340dba-0462-44d3-a1d0-bba9a11fd4c7	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	e264yn	2026-02-07 07:25:40.466
70f42d77-ccbe-4690-a567-c1ae2136808b	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	s5h1s	2026-02-07 07:25:55.975
564a39fc-8637-479e-b3d3-3b1a4253fd84	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	wp9epk	2026-02-07 07:36:47.069
08f08cdf-9323-4c86-83cc-006fa4a7c8b0	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	6g3k3	2026-02-07 07:42:39.258
d6e67e8b-eccf-4fe8-a96b-c683d9595d91	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	biyq6	2026-02-07 07:48:25.514
5ebe183d-7251-4496-b75b-74ff9673db27	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	vtlqj	2026-02-07 08:10:11.449
a96f6928-cd58-49a4-b73c-51a6faa7c78f	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	mhrc9j	2026-02-07 08:12:57.405
79c62af2-2139-4b93-b4ec-460b3a9f8313	9c71dff2-6557-496d-ac91-f6b4912b6375	\N	cdgxbc	2026-02-07 08:19:02.273
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
354a6bf0-d94d-4f20-a99e-84e54c20d27a	Fashion	fashion	Trending fashion items for men and women	\N	\N	t	2025-12-20 17:08:17.149	2025-12-20 17:08:17.149
76e055d8-a8e8-4e3b-8299-b4e692985d2b	Electronics	electronics	Latest gadgets and electronic devices	\N	\N	t	2025-12-20 17:08:17.149	2025-12-20 17:08:17.149
e3016401-9c58-4801-b1e2-b123701595c1	Home & Living	home-living	Beautiful items for your home	\N	\N	t	2025-12-20 17:08:17.149	2025-12-20 17:08:17.149
d0c90871-5651-409f-b847-71c412cfda85	Beauty	beauty	Premium beauty and skincare products	\N	\N	t	2025-12-20 17:08:17.149	2025-12-20 17:08:17.149
\.


--
-- Data for Name: ChatMessage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ChatMessage" (id, "sessionId", "senderType", "senderId", "senderName", message, "isRead", "createdAt") FROM stdin;
9bd6c13a-4b49-45a4-b79b-fca8155d6365	d4a112ad-0f09-4ad9-a071-419136b4c6ba	customer	\N	Guest	hello	t	2025-12-19 01:19:41.87
0a1031c5-42c5-45d4-9b06-7f37897cb253	d4a112ad-0f09-4ad9-a071-419136b4c6ba	customer	\N	Guest	need help	t	2025-12-19 01:19:49.817
92d48350-800d-4a72-a453-3296b82c8c38	d4a112ad-0f09-4ad9-a071-419136b4c6ba	admin	e710fee5-2414-4515-a420-a601e95d2e48	Support	how can i help yoi 	f	2025-12-19 01:20:01.498
83577196-bb8e-4d20-805d-04cbf9879b1e	d4a112ad-0f09-4ad9-a071-419136b4c6ba	customer	\N	Guest	adsfasdf	f	2025-12-19 01:20:07.602
754fba92-aa1e-44b2-baa2-54d4c863a108	d4a112ad-0f09-4ad9-a071-419136b4c6ba	customer	\N	Guest	adsfasdfasdf	f	2025-12-19 01:20:16.266
603eaf45-57ca-41fb-a0e9-379abddaabf1	d4a112ad-0f09-4ad9-a071-419136b4c6ba	customer	\N	Guest	lkjk	f	2025-12-19 01:27:15.821
321ed1ba-dfb3-4405-b036-e3f27e00db93	d4a112ad-0f09-4ad9-a071-419136b4c6ba	customer	\N	Guest	mnb	f	2025-12-19 01:27:26.163
925fc4d7-c65d-4d6d-86c9-ce1539932f1a	a45a915f-cda6-4c6f-a256-9f361bcf1309	customer	\N	Guest	hey	t	2025-12-19 06:47:13.46
8c90a11d-3f32-4a02-9751-9bd28254829a	a45a915f-cda6-4c6f-a256-9f361bcf1309	customer	\N	Guest	asdfasd	f	2025-12-19 06:47:40.604
e2f0c330-875c-425c-bad7-e0a9e6fff967	26a506f6-120f-4010-88da-86a20907faf2	customer	59a22c3c-1d30-4c60-ab37-764a2088541b	Cyres Tylor	Hi	f	2025-12-19 16:06:19.043
64d67514-3d16-484b-89c2-ef4118d32466	e1eae3a7-db68-4687-9f74-2fb9666d6e31	customer	4657508a-a0fd-433b-87f8-9fd906b61ddf	shohrab hossain	Hii	t	2026-01-29 14:28:09.339
ea4e041d-1a35-4ca8-a00c-6f3967be28c2	e1eae3a7-db68-4687-9f74-2fb9666d6e31	admin	591ddf6b-acf5-4e79-b069-a31a1ea7879d	Support	hello	f	2026-01-29 14:28:53.383
1ef1f6f8-2d73-4ac3-abbd-51e55009a670	e1eae3a7-db68-4687-9f74-2fb9666d6e31	customer	4657508a-a0fd-433b-87f8-9fd906b61ddf	shohrab hossain	Hi	t	2026-01-29 14:30:03.508
a54aa951-ebba-4357-8efa-fa6f68667c2f	e1eae3a7-db68-4687-9f74-2fb9666d6e31	admin	591ddf6b-acf5-4e79-b069-a31a1ea7879d	Support	kjyjkhlgjhgk	f	2026-01-29 14:30:14.562
\.


--
-- Data for Name: ChatRestriction; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ChatRestriction" (id, "sessionId", "userId", "restrictedUntil", reason, "createdBy", "createdAt") FROM stdin;
134e6086-de6f-434b-968a-ca8404838352	chat_1766105180429_4wq6u3ovbnt	\N	2025-12-19 01:32:21.821	Restricted by admin	e710fee5-2414-4515-a420-a601e95d2e48	2025-12-19 01:27:21.822
\.


--
-- Data for Name: ChatSession; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ChatSession" (id, "sessionId", "userId", "customerName", "customerEmail", status, "assignedTo", "createdAt", "updatedAt") FROM stdin;
d4a112ad-0f09-4ad9-a071-419136b4c6ba	chat_1766105180429_4wq6u3ovbnt	\N	Guest	\N	active	\N	2025-12-19 01:19:41.41	2025-12-19 01:27:26.611
a45a915f-cda6-4c6f-a256-9f361bcf1309	chat_1766126796845_tgn80xwsbj9	\N	Guest	\N	active	\N	2025-12-19 06:47:13.018	2025-12-19 06:47:41.052
26a506f6-120f-4010-88da-86a20907faf2	chat_1766160189122_hksv2n90ckj	59a22c3c-1d30-4c60-ab37-764a2088541b	Cyres Tylor	tylorcyres@gmail.com	active	\N	2025-12-19 16:06:18.59	2025-12-19 16:06:19.498
e1eae3a7-db68-4687-9f74-2fb9666d6e31	chat_1769696863251_0t4zjce89ckd	4657508a-a0fd-433b-87f8-9fd906b61ddf	shohrab hossain	shohrabhossain715@gmail.com	active	\N	2026-01-29 14:28:08.7	2026-01-29 14:30:14.988
\.


--
-- Data for Name: ContactMessage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ContactMessage" (id, name, email, phone, subject, message, "isRead", "isReplied", "adminNotes", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Coupon; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Coupon" (id, code, description, "discountType", "discountValue", "minOrderValue", "maxDiscount", "validFrom", "validUntil", "usageLimit", "usedCount", "isActive", "createdAt", "updatedAt", "autoApply", "targetAudience") FROM stdin;
cc423283-5fad-4757-8124-0b3f54e5b3fe	SAVE500	Save 500 BDT on orders above 5000	fixed	500	5000	\N	2025-12-20 17:08:39.307	2026-02-18 17:08:39.307	50	0	t	2025-12-20 17:08:39.308	2025-12-20 17:08:39.308	f	all
6fdc5b63-ed61-40c5-85ec-7f689d98fab6	WELCOME10	Welcome discount for new customers	percentage	10	1000	\N	2025-12-20 17:08:39.307	2026-03-20 17:08:39.307	100	1	t	2025-12-20 17:08:39.308	2026-01-29 14:14:12.698	f	all
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
-- Data for Name: InternalMessage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."InternalMessage" (id, "senderId", "receiverId", content, "isRead", "createdAt") FROM stdin;
\.


--
-- Data for Name: InventoryLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."InventoryLog" (id, "productId", "variantId", "previousStock", "newStock", change, reason, "orderId", "userId", notes, "createdAt") FROM stdin;
33e7434e-532d-4fb7-9694-7bf67ec34540	66ff844c-3640-416f-89e3-73458c28bf88	07be9327-a344-49dd-830d-4305c8a8bf43	35	31	-4	order	8f803d36-fd5f-4cf1-a305-c3cd10064983	591ddf6b-acf5-4e79-b069-a31a1ea7879d	Order #CTG1770272683940574 - 4 units sold	2026-02-05 06:24:48.525
4c035cd0-6f84-4a79-839c-7528bbb62332	842e2dbf-90fb-4294-a0f3-99343a94e362	321f0f85-b0f2-4ac4-8ff4-55550989e5d6	39	35	-4	order	0264eab4-a533-4d31-a2f7-1649909d962c	591ddf6b-acf5-4e79-b069-a31a1ea7879d	Order #CTG1770272827410722 - 4 units sold	2026-02-05 06:27:12.021
\.


--
-- Data for Name: LoyaltyPoints; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LoyaltyPoints" (id, "userId", "tierId", "totalPoints", "lifetimePoints", "lifetimeSpent", "redeemedPoints", "tierUpdatedAt", "createdAt", "updatedAt") FROM stdin;
47f780bc-62ea-4f54-bc72-8e0ef2b6a87d	22e6c85f-944c-48a7-bd73-e8583810d66a	f33baeb1-375a-4f2b-a555-5b8692d2b919	0	0	0	0	2026-01-24 13:31:05.383	2026-01-24 13:31:05.384	2026-01-24 13:31:05.384
48184f45-ec87-4895-a56a-85a9f782c738	4657508a-a0fd-433b-87f8-9fd906b61ddf	82e0008a-a3ee-490c-a464-912c7fa020c9	941	941	94124.7	0	2026-01-29 14:17:13.993	2026-01-29 14:17:11.966	2026-01-29 14:17:13.994
\.


--
-- Data for Name: LoyaltySettings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LoyaltySettings" (id, "isEnabled", "pointsPerTaka", "pointsToTakaRatio", "referralBonusReferrer", "referralBonusReferred", "minimumRedeemPoints", "createdAt", "updatedAt") FROM stdin;
34512df4-baaa-40be-a0bb-80a3a565d28c	t	0.1	10	100	50	500	2025-12-19 19:46:36.077	2025-12-19 20:50:19.643
\.


--
-- Data for Name: LoyaltyTier; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LoyaltyTier" (id, name, "displayName", "minSpending", "discountPercent", "freeShipping", "freeShippingMin", "pointsMultiplier", "prioritySupport", "earlyAccess", "exclusiveDeals", "birthdayBonus", color, icon, "sortOrder", "isActive", "createdAt", "updatedAt") FROM stdin;
91b5cee6-3620-4b04-8c81-d0d7893e28b9	bronze	Bronze	5000	1	f	3000	1.5	f	t	f	100	#CD7F32	bronze	1	t	2025-12-19 20:46:51.183	2025-12-19 20:46:51.183
aa8e159e-6711-4a9b-92e3-b9d89ce1af29	silver	Silver	15000	2	t	1998	2	f	t	f	300	#C0C0C0	silver	2	t	2025-12-19 20:46:51.183	2025-12-19 20:46:51.183
58a9a00e-3213-45a0-b141-54c7f58a312f	gold	Gold	40000	4	t	1499	2.5	t	t	f	400	#FFD700	gold	3	t	2025-12-19 20:46:51.183	2025-12-19 20:46:51.183
82e0008a-a3ee-490c-a464-912c7fa020c9	platinum	Platinum	60000	7	t	1199	3	t	t	t	500	#8C8C8C	platinum	4	t	2025-12-19 20:46:51.183	2025-12-19 20:46:51.183
2387399a-c99d-43ec-bd8d-fd5b9de8489d	diamond	Diamond	100000	9	t	1000	5	t	t	t	1000	#B9F2FF	diamond	5	t	2025-12-19 20:46:51.183	2025-12-19 20:46:51.183
40d88cc5-4f32-4c1f-a410-bc2524a411f9	emerald	Emerald	120000	10	t	1000	6	t	t	t	750	#50C878	emerald	6	t	2025-12-19 20:46:51.183	2025-12-19 20:46:51.183
7552e1a2-9db5-4e9e-8c65-7b2cb7e5b255	ruby	Ruby	150000	11	t	800	7	t	t	t	1000	#E0115F	ruby	7	t	2025-12-19 20:46:51.183	2025-12-19 20:46:51.183
7da76aca-eed2-45a8-93a8-0fa37b819334	sapphire	Sapphire	250000	11	t	800	8	t	t	t	1500	#0F52BA	sapphire	8	t	2025-12-19 20:46:51.183	2025-12-19 20:46:51.183
e657a6bc-401c-4842-8e65-effb9559dfb3	obsidian	Obsidian	400000	13	t	700	10	t	t	t	2000	#1C1C1C	obsidian	9	t	2025-12-19 20:46:51.183	2025-12-19 20:46:51.183
f33baeb1-375a-4f2b-a555-5b8692d2b919	legendary	Legendary	600000	15	t	\N	15	t	t	t	5000	#FFD700	legendary	10	t	2025-12-19 20:46:51.183	2025-12-19 20:46:51.183
\.


--
-- Data for Name: NewsletterSubscriber; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."NewsletterSubscriber" (id, email, source, "discountCode", "isActive", "confirmedAt", "unsubscribedAt", "createdAt", "updatedAt") FROM stdin;
ca0a5b92-7341-4bc4-9792-2fedc3d439b7	sanim7004@gmail.com	footer	\N	t	2026-01-26 12:17:05.447	\N	2026-01-26 12:17:05.448	2026-01-26 12:17:05.448
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
92dabb31-712a-4d00-ba73-da81559fd6bb	ff24e233-4d65-4949-aa9f-60880e06ac5d	order	🛒 New Order Received!	Sanim Ahmed placed an order (৳86,078)	f	/admin/orders	2025-12-18 23:43:51.983
92f85516-ab91-4454-a533-1e70f1ee6592	ff24e233-4d65-4949-aa9f-60880e06ac5d	order	🛒 New Order Received!	Sanim Ahmed placed an order (৳5,079)	f	/admin/orders	2025-12-19 00:36:30.882
c95de5ed-ed08-438c-ac22-6bb67ee59578	ff24e233-4d65-4949-aa9f-60880e06ac5d	chat	💬 New Chat Message!	Guest sent a message	f	/admin/chat	2025-12-19 01:19:43.24
bfe1610a-3c34-4c9e-a44b-5ca07d34e708	ff24e233-4d65-4949-aa9f-60880e06ac5d	chat	💬 New Chat Message!	Guest sent a message	f	/admin/chat	2025-12-19 01:19:50.504
fd9e2d0e-62d6-4263-904f-5d20a5c7b463	ff24e233-4d65-4949-aa9f-60880e06ac5d	chat	💬 New Chat Message!	Guest sent a message	f	/admin/chat	2025-12-19 01:20:08.916
749f1cdf-577a-4064-960d-ea72de4a157e	ff24e233-4d65-4949-aa9f-60880e06ac5d	chat	💬 New Chat Message!	Guest sent a message	f	/admin/chat	2025-12-19 01:20:17.678
c216b11f-8ff7-4114-982d-c73274e97f8a	ff24e233-4d65-4949-aa9f-60880e06ac5d	chat	💬 New Chat Message!	Guest sent a message	f	/admin/chat	2025-12-19 01:27:17.187
f1cc7ac9-7e3d-4fa2-81f2-782557c4f8aa	ff24e233-4d65-4949-aa9f-60880e06ac5d	chat	💬 New Chat Message!	Guest sent a message	f	/admin/chat	2025-12-19 01:27:27.51
2e76aa53-efc9-4721-8378-81fc9c2c50bd	ff24e233-4d65-4949-aa9f-60880e06ac5d	chat	💬 New Chat Message!	Guest sent a message	f	/admin/chat	2025-12-19 06:47:14.785
200b0f09-2028-4509-9e7f-9c27232db989	ff24e233-4d65-4949-aa9f-60880e06ac5d	chat	💬 New Chat Message!	Guest sent a message	f	/admin/chat	2025-12-19 06:47:41.952
9d4c022a-9a13-45f6-a008-ef48f013ce0b	ff24e233-4d65-4949-aa9f-60880e06ac5d	chat	💬 New Chat Message!	Cyres Tylor sent a message	f	/admin/chat	2025-12-19 16:06:20.399
d2dc0db3-2a38-423c-9467-ff36723952e6	59a22c3c-1d30-4c60-ab37-764a2088541b	account	🎊 Congratulations! Role Upgraded	You have been promoted to Seller! Welcome to the team.	f	/dashboard	2025-12-19 19:56:12.4
8221d366-f4bb-45cb-991a-9484fe94a8d0	59a22c3c-1d30-4c60-ab37-764a2088541b	account	📋 Account Role Updated	Your account role has been changed to Customer.	f	/dashboard	2025-12-19 19:56:41.57
a878dcfd-19e4-4432-91e7-050d5b0cf0ab	93512fb3-25b3-46f4-8c76-2d2eb8d40b3b	account	🎊 Congratulations! Role Upgraded	You have been promoted to Seller! Welcome to the team.	f	/dashboard	2025-12-19 19:56:44.218
8de6bc40-1b1f-4fee-9987-083ca43d0a70	e710fee5-2414-4515-a420-a601e95d2e48	order	🛒 New Order Received!	Sanim Ahmed placed an order (৳86,078)	t	/admin/orders	2025-12-18 23:43:51.983
b3bdb6ff-6c4f-445f-80e9-d23aa374c450	e710fee5-2414-4515-a420-a601e95d2e48	order	🛒 New Order Received!	Sanim Ahmed placed an order (৳5,079)	t	/admin/orders	2025-12-19 00:36:30.882
2376e5f3-f991-47cf-ba11-acea62c78c67	e710fee5-2414-4515-a420-a601e95d2e48	order	✅ Order Confirmed!	Your order has been confirmed and is being processed.	t	/dashboard/orders	2025-12-19 00:36:31.355
03dc9412-948c-4284-81fd-6b6ede0dc431	e710fee5-2414-4515-a420-a601e95d2e48	chat	💬 New Chat Message!	Guest sent a message	t	/admin/chat	2025-12-19 01:19:43.24
c6c67bb1-4a0e-4490-9e44-9f02ce7404c5	e710fee5-2414-4515-a420-a601e95d2e48	chat	💬 New Chat Message!	Guest sent a message	t	/admin/chat	2025-12-19 01:19:50.504
8f7ffc1e-7ffa-43bb-8e42-5742cae5857e	e710fee5-2414-4515-a420-a601e95d2e48	chat	💬 New Chat Message!	Guest sent a message	t	/admin/chat	2025-12-19 01:20:08.917
0fab63bc-aaa1-48a5-aa22-273f7cadf279	e710fee5-2414-4515-a420-a601e95d2e48	chat	💬 New Chat Message!	Guest sent a message	t	/admin/chat	2025-12-19 01:20:17.678
7c2a55ed-6f04-469c-a70a-2705a80875d6	e710fee5-2414-4515-a420-a601e95d2e48	chat	💬 New Chat Message!	Guest sent a message	t	/admin/chat	2025-12-19 01:27:17.187
bd1d1312-d97a-483c-a0f8-911bb232c9a9	e710fee5-2414-4515-a420-a601e95d2e48	chat	💬 New Chat Message!	Guest sent a message	t	/admin/chat	2025-12-19 01:27:27.51
78478084-b153-4f85-a1b9-68d813012a44	e710fee5-2414-4515-a420-a601e95d2e48	chat	💬 New Chat Message!	Guest sent a message	t	/admin/chat	2025-12-19 06:47:14.785
119a2d19-3278-4971-a6dd-a5c1bbecec20	e710fee5-2414-4515-a420-a601e95d2e48	chat	💬 New Chat Message!	Guest sent a message	t	/admin/chat	2025-12-19 06:47:41.952
a45a8f6f-1ef7-4b2e-9292-682b6c924135	e710fee5-2414-4515-a420-a601e95d2e48	chat	💬 New Chat Message!	Cyres Tylor sent a message	t	/admin/chat	2025-12-19 16:06:20.4
4cc76fde-a34e-4997-8e1d-18d791bd75ec	ff24e233-4d65-4949-aa9f-60880e06ac5d	order	🛒 New Order Received!	Sanim Ahmed placed an order (৳4,129)	f	/admin/orders	2025-12-19 23:51:20.851
eee88b23-f616-4cc0-a901-df3fb1aae86f	e710fee5-2414-4515-a420-a601e95d2e48	order	🛒 New Order Received!	Sanim Ahmed placed an order (৳4,129)	f	/admin/orders	2025-12-19 23:51:20.851
8eb8de44-f291-4403-8277-445b3783d5ed	e710fee5-2414-4515-a420-a601e95d2e48	order	✅ Order Confirmed!	Your order has been confirmed and is being processed.	f	/dashboard/orders	2025-12-19 23:51:22.649
f5140122-64e4-4a30-92f8-46859c7e6403	22e6c85f-944c-48a7-bd73-e8583810d66a	account	🎊 Congratulations! Role Upgraded	You have been promoted to Seller! Welcome to the team.	f	/dashboard	2025-12-20 20:44:41.177
ed73fa0a-c32f-4fa8-9bd3-609a6fe593b8	22e6c85f-944c-48a7-bd73-e8583810d66a	account	📋 Account Role Updated	Your account role has been changed to Customer.	f	/dashboard	2026-01-24 13:30:22.345
476423a2-2217-4ea2-bb38-6533a0664567	22e6c85f-944c-48a7-bd73-e8583810d66a	account	🎊 Congratulations! Role Upgraded	You have been promoted to Seller! Welcome to the team.	f	/dashboard	2026-01-24 13:30:34.591
215da515-c041-431e-9bd9-6ce40f7d17d2	22e6c85f-944c-48a7-bd73-e8583810d66a	loyalty	🏆 Membership Tier Updated!	Congratulations! You are now a Legendary member. Enjoy exclusive benefits!	f	/dashboard/loyalty	2026-01-24 13:31:10.281
712d2865-c214-4093-a5e3-1ee7e30651d1	ad1eb1e3-c1ce-417c-a337-470197a9d084	order	🛒 New Order Received!	shohrab hossain placed an order (৳4,629)	f	/admin/orders	2026-01-29 13:47:49.297
a04bd454-aa06-42b8-a261-cbc4af5ef11c	591ddf6b-acf5-4e79-b069-a31a1ea7879d	order	🛒 New Order Received!	shohrab hossain placed an order (৳4,629)	f	/admin/orders	2026-01-29 13:47:49.297
1c592feb-c766-470c-a65d-2e4612d5e9ff	4657508a-a0fd-433b-87f8-9fd906b61ddf	order	✅ Order Confirmed!	Your order has been confirmed and is being processed.	t	/dashboard/orders	2026-01-29 13:47:49.942
0bd9c07d-b842-4d1f-bb10-2c29b7d8424c	591ddf6b-acf5-4e79-b069-a31a1ea7879d	order	🛒 New Order Received!	shohrab hossain placed an order (৳94,124.7)	f	/admin/orders	2026-01-29 14:14:18.986
40be2610-d63d-4816-bfb9-4f50a7c4e225	ad1eb1e3-c1ce-417c-a337-470197a9d084	order	🛒 New Order Received!	shohrab hossain placed an order (৳94,124.7)	f	/admin/orders	2026-01-29 14:14:18.986
0c678fe1-2b29-4507-84f4-0c4ef098d874	4657508a-a0fd-433b-87f8-9fd906b61ddf	order	✅ Order Confirmed!	Your order has been confirmed and is being processed.	t	/dashboard/orders	2026-01-29 14:14:19.418
69fdf4a3-cb05-4b6f-8249-0b59f2dc38fe	4657508a-a0fd-433b-87f8-9fd906b61ddf	order	📦 Order Shipped!	Your order is on the way!	f	/dashboard/orders	2026-01-29 14:16:38.863
8d0a2abb-65af-4932-87d8-fa4d4b776089	4657508a-a0fd-433b-87f8-9fd906b61ddf	order	🎉 Order Delivered!	Your order has been delivered. Thank you for shopping with us!	f	/dashboard/orders	2026-01-29 14:17:11.318
612cae22-c2d2-4727-a8fb-ca606f9d9b1c	4657508a-a0fd-433b-87f8-9fd906b61ddf	loyalty	🏆 Membership Tier Updated!	Congratulations! You are now a Platinum member. Enjoy exclusive benefits!	f	/dashboard/loyalty	2026-01-29 14:17:16.143
ad6364ae-7628-45d0-af0d-b48064a91de2	4657508a-a0fd-433b-87f8-9fd906b61ddf	account	⚠️ Account Deactivated	Your account has been temporarily deactivated. Please contact support for assistance.	f	\N	2026-01-29 14:21:05.304
497a7fbc-c0bb-4b0c-b53a-2e9179619de5	4657508a-a0fd-433b-87f8-9fd906b61ddf	account	✅ Account Reactivated	Great news! Your account has been reactivated. Welcome back!	f	/dashboard	2026-01-29 14:21:44.723
e5821439-eaa7-4b57-ab0d-436f9c4a06c3	4657508a-a0fd-433b-87f8-9fd906b61ddf	account	🎊 Congratulations! Role Upgraded	You have been promoted to Seller! Welcome to the team.	f	/dashboard	2026-01-29 14:21:55.011
d597a011-5e58-405c-97ff-866598f94a53	4657508a-a0fd-433b-87f8-9fd906b61ddf	account	📋 Account Role Updated	Your account role has been changed to Customer.	f	/dashboard	2026-01-29 14:23:34.274
bb2a77ce-7eb4-48a6-a532-183848b0b995	4657508a-a0fd-433b-87f8-9fd906b61ddf	account	🎊 Congratulations! Role Upgraded	You have been promoted to Admin! Welcome to the team.	f	/dashboard	2026-01-29 14:23:43.375
f4e7155e-4398-4602-89bf-4e1fa761aa8b	4657508a-a0fd-433b-87f8-9fd906b61ddf	account	📋 Account Role Updated	Your account role has been changed to Customer.	f	/dashboard	2026-01-29 14:24:14.384
8df36c13-3693-4fae-9891-e425e7669f77	4657508a-a0fd-433b-87f8-9fd906b61ddf	account	🎊 Congratulations! Role Upgraded	You have been promoted to Seller! Welcome to the team.	f	/dashboard	2026-01-29 14:24:23.55
c8a2e5c4-0fa0-4355-8223-a64d8435aaaa	4657508a-a0fd-433b-87f8-9fd906b61ddf	account	📋 Account Role Updated	Your account role has been changed to Customer.	f	/dashboard	2026-01-29 14:27:24.63
240d1c05-4efb-42ab-8941-d0a40cd3dfea	ad1eb1e3-c1ce-417c-a337-470197a9d084	chat	💬 New Chat Message!	shohrab hossain sent a message	f	/admin/chat	2026-01-29 14:28:10.658
bdc291c6-b5d3-42ff-88b9-d3fb2aa69f7a	591ddf6b-acf5-4e79-b069-a31a1ea7879d	chat	💬 New Chat Message!	shohrab hossain sent a message	f	/admin/chat	2026-01-29 14:28:10.659
45c13c3e-e894-4836-a402-e45096842cd0	ad1eb1e3-c1ce-417c-a337-470197a9d084	chat	💬 New Chat Message!	shohrab hossain sent a message	f	/admin/chat	2026-01-29 14:30:04.789
5045febe-91e7-4bf3-8a72-cf86ce04454a	591ddf6b-acf5-4e79-b069-a31a1ea7879d	chat	💬 New Chat Message!	shohrab hossain sent a message	f	/admin/chat	2026-01-29 14:30:04.789
0840e937-5509-46f8-860e-db0ce232189c	ad1eb1e3-c1ce-417c-a337-470197a9d084	order	🛒 New Order Received!	Sanim Ahmed placed an order (৳22,126)	f	/admin/orders	2026-02-05 06:24:49.864
433ceea7-5c57-42e4-9bca-8f1e71ce484d	591ddf6b-acf5-4e79-b069-a31a1ea7879d	order	🛒 New Order Received!	Sanim Ahmed placed an order (৳22,126)	f	/admin/orders	2026-02-05 06:24:49.864
e9a2d3f4-5cb6-4350-8c4c-a5e93eb40904	591ddf6b-acf5-4e79-b069-a31a1ea7879d	order	✅ Order Confirmed!	Your order has been confirmed and is being processed.	f	/dashboard/orders	2026-02-05 06:24:50.505
98c405be-8d46-4b28-b945-a2c15e173dcf	ad1eb1e3-c1ce-417c-a337-470197a9d084	order	🛒 New Order Received!	Sanim Ahmed placed an order (৳32,130)	f	/admin/orders	2026-02-05 06:27:13.369
0aa89495-cb31-42be-b7ea-85746620e227	591ddf6b-acf5-4e79-b069-a31a1ea7879d	order	🛒 New Order Received!	Sanim Ahmed placed an order (৳32,130)	f	/admin/orders	2026-02-05 06:27:13.369
1a328024-c0da-4ab8-aff4-1ba71ec05905	591ddf6b-acf5-4e79-b069-a31a1ea7879d	order	✅ Order Confirmed!	Your order has been confirmed and is being processed.	f	/dashboard/orders	2026-02-05 06:27:14.002
b7d2304d-6bda-4760-8763-9f6a672e1a52	155e5c17-0e7d-463d-8b9b-db2019635519	welcome	🎉 Welcome to CTG Collection!	Hi Istiak Ahmed, thank you for joining us! Explore our amazing products.	f	/shop	2026-02-05 10:21:41.557
f1490a9f-d461-4ff9-bfb1-902a8bf5b898	ad1eb1e3-c1ce-417c-a337-470197a9d084	user	👤 New User Registered!	Istiak Ahmed (sanim17@gmail.com) just joined.	f	/admin/customers	2026-02-05 10:21:42.755
b0a725a7-6e53-4ab7-b63a-d8546787ce93	591ddf6b-acf5-4e79-b069-a31a1ea7879d	user	👤 New User Registered!	Istiak Ahmed (sanim17@gmail.com) just joined.	f	/admin/customers	2026-02-05 10:21:42.755
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Order" (id, "orderNumber", "userId", "guestEmail", "addressId", name, phone, subtotal, "shippingCost", discount, total, "couponCode", status, "paymentMethod", "paymentStatus", "trackingNumber", notes, "pointsEarned", "pointsRedeemed", "paymentConfirmedAt", "receiptSentAt", "receiptUrl", "verificationCode", "createdAt", "updatedAt") FROM stdin;
0264eab4-a533-4d31-a2f7-1649909d962c	CTG1770272827410722	591ddf6b-acf5-4e79-b069-a31a1ea7879d	\N	781ca86b-c348-48e7-8773-922fcf5ed813	\N	\N	32000	130	0	32130	\N	confirmed	cod	paid	\N	\N	0	0	2026-02-05 06:29:55.22	\N	\N	3D2PP3	2026-02-05 06:27:07.851	2026-02-05 06:29:58.853
8f803d36-fd5f-4cf1-a305-c3cd10064983	CTG1770272683940574	591ddf6b-acf5-4e79-b069-a31a1ea7879d	\N	e3078855-a944-45c3-98ae-d137b7545d0b	\N	\N	21996	130	0	22126	\N	confirmed	cod	paid	\N	\N	0	0	2026-02-05 08:35:57.751	\N	\N	WTSQPK	2026-02-05 06:24:44.382	2026-02-05 08:36:14.06
03a10f56-5976-4d1e-ac61-0d3fafaf33e9	CTG1769694463942709	4657508a-a0fd-433b-87f8-9fd906b61ddf	\N	779e7619-085c-4468-9951-fef2091d04cc	\N	\N	4499	130	0	4629	\N	confirmed	sslcommerz	paid	\N	\N	0	0	2026-01-29 13:51:42.477	\N	\N	76XZ9P	2026-01-29 13:47:44.411	2026-01-29 13:51:57.688
eb2d3655-d7d6-43e5-b2d5-490022482f94	CTG1769696051827662	4657508a-a0fd-433b-87f8-9fd906b61ddf	\N	4da4ccdb-c467-46cf-879f-16e75fd64c9b	\N	\N	117493	130	11749.3	94124.7	WELCOME10	delivered	cod	paid	\N	\N	0	0	2026-01-29 14:15:43.01	2026-02-05 05:11:10.901	\N	FH7KPR	2026-01-29 14:14:13.133	2026-02-05 05:11:10.902
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."OrderItem" (id, "orderId", "productId", "variantInfo", quantity, price, "createdAt") FROM stdin;
2b277d9e-4d84-4d66-8156-5e3f26292d0a	03a10f56-5976-4d1e-ac61-0d3fafaf33e9	99e934ec-c57c-4008-984d-b46eccfb56fe	{"size":"Standard","color":"Black","variantId":"fb0c4349-673b-431d-b1fa-1b4c25a7eb2a"}	1	4499	2026-01-29 13:47:44.411
86960620-a92c-4b84-9819-702bb7f363c2	eb2d3655-d7d6-43e5-b2d5-490022482f94	842e2dbf-90fb-4294-a0f3-99343a94e362	{"size":"","color":"","variantId":"321f0f85-b0f2-4ac4-8ff4-55550989e5d6"}	10	8000	2026-01-29 14:14:13.133
8da6cbc1-885d-48f4-beae-b31a58af79b5	eb2d3655-d7d6-43e5-b2d5-490022482f94	36b8ee03-6700-493c-8494-82880cb58b28	{"size":"Full Set","color":"Gold","variantId":"78f2ba4b-6431-4bdf-bb36-651ff7bc161b"}	3	6499	2026-01-29 14:14:13.133
58932b6e-5954-4e27-b98f-eb8f9d2cc983	eb2d3655-d7d6-43e5-b2d5-490022482f94	99e934ec-c57c-4008-984d-b46eccfb56fe	{"size":"Standard","color":"Black","variantId":"fb0c4349-673b-431d-b1fa-1b4c25a7eb2a"}	4	4499	2026-01-29 14:14:13.133
6072d1f3-938e-47aa-8545-becd8e037150	8f803d36-fd5f-4cf1-a305-c3cd10064983	66ff844c-3640-416f-89e3-73458c28bf88	{"size":"12-Cup","color":"Stainless Steel","variantId":"07be9327-a344-49dd-830d-4305c8a8bf43"}	4	5499	2026-02-05 06:24:44.382
73713f15-95e4-4f5d-a126-3f5cab0b4e7a	0264eab4-a533-4d31-a2f7-1649909d962c	842e2dbf-90fb-4294-a0f3-99343a94e362	{"size":"","color":"","variantId":"321f0f85-b0f2-4ac4-8ff4-55550989e5d6"}	4	8000	2026-02-05 06:27:07.851
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Payment" (id, "orderId", "transactionId", method, amount, status, "gatewayResponse", "createdAt", "updatedAt") FROM stdin;
23717994-11d3-426d-98b8-2cfe4023fa13	03a10f56-5976-4d1e-ac61-0d3fafaf33e9	TXN1769694471484	sslcommerz	4629	pending	{"status":"SUCCESS","failedreason":"","sessionkey":"256B1C1DA3B6138C50A7BC349147A702","gw":{"visa":"city_visa,ebl_visa,visacard","master":"city_master,ebl_master,mastercard","amex":"city_amex,amexcard","othercards":"qcash,fastcash","internetbanking":"city,abbank,bankasia,ibbl,mtbl,tapnpay,eblsky,instapay,pmoney,woori,modhumoti,fsibl","mobilebanking":"dbblmobilebanking,bkash,nagad,abbank,ibbl,tap,upay,okaywallet,cellfine,mcash"},"redirectGatewayURL":"","directPaymentURLBank":"","directPaymentURLCard":"","directPaymentURL":"","redirectGatewayURLFailed":"","GatewayPageURL":"https://sandbox.sslcommerz.com/EasyCheckOut/testcde256b1c1da3b6138c50a7bc349147a702","storeBanner":"https://sandbox.sslcommerz.com/stores/logos/demoLogo.png","storeLogo":"https://sandbox.sslcommerz.com/stores/logos/demoLogo.png","store_name":"Demo","desc":[{"name":"AMEX","type":"amex","logo":"https://sandbox.sslcommerz.com/gwprocess/v4/image/gw/amex.png","gw":"amexcard","r_flag":"1","redirectGatewayURL":"https://sandbox.sslcommerz.com/gwprocess/v4/bankgw/indexhtmlOTP.php?mamount=4629.00&ssl_id=260129194751sP9QXo4BRVsgKnK&Q=REDIRECT&SESSIONKEY=256B1C1DA3B6138C50A7BC349147A702&tran_type=success&cardname=amexcard"},{"name":"VISA","type":"visa","logo":"https://sandbox.sslcommerz.com/gwprocess/v4/image/gw/visa.png","gw":"visacard","r_flag":"1","redirectGatewayURL":"https://sandbox.sslcommerz.com/gwprocess/v4/bankgw/indexhtmlOTP.php?mamount=4629.00&ssl_id=260129194751sP9QXo4BRVsgKnK&Q=REDIRECT&SESSIONKEY=256B1C1DA3B6138C50A7BC349147A702&tran_type=success&cardname=visavard"},{"name":"MASTER","type":"master","logo":"https://sandbox.sslcommerz.com/gwprocess/v4/image/gw/master.png","gw":"mastercard","r_flag":"1","redirectGatewayURL":"https://sandbox.sslcommerz.com/gwprocess/v4/bankgw/indexhtmlOTP.php?mamount=4629.00&ssl_id=260129194751sP9QXo4BRVsgKnK&Q=REDIRECT&SESSIONKEY=256B1C1DA3B6138C50A7BC349147A702&tran_type=success&cardname=mastercard"},{"name":"AMEX-City Bank","type":"amex","logo":"https://sandbox.sslcommerz.com/gwprocess/v4/image/gw/amex.png","gw":"city_amex","r_flag":"1","redirectGatewayURL":"https://sandbox.sslcommerz.com/gwprocess/v4/bankgw/indexhtmlOTP.php?mamount=4629.00&ssl_id=260129194751sP9QXo4BRVsgKnK&Q=REDIRECT&SESSIONKEY=256B1C1DA3B6138C50A7BC349147A702&tran_type=success&cardname=city_amex"},{"name":"QCash","type":"othercards","logo":"https://sandbox.sslcommerz.com/gwprocess/v4/image/gw/qcash.png","gw":"qcash","r_flag":"1","redirectGatewayURL":"https://sandbox.sslcommerz.com/gwprocess/v4/bankgw/indexhtmlOTP.php?mamount=4629.00&ssl_id=260129194751sP9QXo4BRVsgKnK&Q=REDIRECT&SESSIONKEY=256B1C1DA3B6138C50A7BC349147A702&tran_type=success&cardname=qcash"},{"name":"Fast Cash","type":"othercards","logo":"https://sandbox.sslcommerz.com/gwprocess/v4/image/gw/fastcash.png","gw":"fastcash"},{"name":"bKash","type":"mobilebanking","logo":"https://sandbox.sslcommerz.com/gwprocess/v4/image/gw/bkash.png","gw":"bkash","r_flag":"1","redirectGatewayURL":"https://sandbox.sslcommerz.com/gwprocess/v4/bankgw/indexhtmlOTP.php?mamount=4629.00&ssl_id=260129194751sP9QXo4BRVsgKnK&Q=REDIRECT&SESSIONKEY=256B1C1DA3B6138C50A7BC349147A702&tran_type=success&cardname=bkash"},{"name":"Nagad","type":"mobilebanking","logo":"https://sandbox.sslcommerz.com/gwprocess/v4/image/gw/nagad.png","gw":"nagad","r_flag":"1","redirectGatewayURL":"https://sandbox.sslcommerz.com/gwprocess/v4/bankgw/indexhtmlOTP.php?mamount=4629.00&ssl_id=260129194751sP9QXo4BRVsgKnK&Q=REDIRECT&SESSIONKEY=256B1C1DA3B6138C50A7BC349147A702&tran_type=success&cardname=nagad"},{"name":"DBBL Mobile Banking","type":"mobilebanking","logo":"https://sandbox.sslcommerz.com/gwprocess/v4/image/gw/dbblmobilebank.png","gw":"dbblmobilebanking","r_flag":"1","redirectGatewayURL":"https://sandbox.sslcommerz.com/gwprocess/v4/bankgw/indexhtmlOTP.php?mamount=4629.00&ssl_id=260129194751sP9QXo4BRVsgKnK&Q=REDIRECT&SESSIONKEY=256B1C1DA3B6138C50A7BC349147A702&tran_type=success&cardname=dbblmobilebanking"},{"name":"AB Direct","type":"mobilebanking","logo":"https://sandbox.sslcommerz.com/gwprocess/v4/image/gw/abbank.png","gw":"abbank","r_flag":"1","redirectGatewayURL":"https://sandbox.sslcommerz.com/gwprocess/v4/bankgw/indexhtmlOTP.php?mamount=4629.00&ssl_id=260129194751sP9QXo4BRVsgKnK&Q=REDIRECT&SESSIONKEY=256B1C1DA3B6138C50A7BC349147A702&tran_type=success&cardname=abbank"},{"name":"AB Direct","type":"internetbanking","logo":"https://sandbox.sslcommerz.com/gwprocess/v4/image/gw/abbank.png","gw":"abbank","r_flag":"1","redirectGatewayURL":"https://sandbox.sslcommerz.com/gwprocess/v4/bankgw/indexhtmlOTP.php?mamount=4629.00&ssl_id=260129194751sP9QXo4BRVsgKnK&Q=REDIRECT&SESSIONKEY=256B1C1DA3B6138C50A7BC349147A702&tran_type=success&cardname=abbank"},{"name":"IBBL","type":"internetbanking","logo":"https://sandbox.sslcommerz.com/gwprocess/v4/image/gw/ibbl.png","gw":"ibbl","r_flag":"1","redirectGatewayURL":"https://sandbox.sslcommerz.com/gwprocess/v4/bankgw/indexhtmlOTP.php?mamount=4629.00&ssl_id=260129194751sP9QXo4BRVsgKnK&Q=REDIRECT&SESSIONKEY=256B1C1DA3B6138C50A7BC349147A702&tran_type=success&cardname=ibbl"},{"name":"Citytouch","type":"internetbanking","logo":"https://sandbox.sslcommerz.com/gwprocess/v4/image/gw/citytouch.png","gw":"city","r_flag":"1","redirectGatewayURL":"https://sandbox.sslcommerz.com/gwprocess/v4/bankgw/indexhtmlOTP.php?mamount=4629.00&ssl_id=260129194751sP9QXo4BRVsgKnK&Q=REDIRECT&SESSIONKEY=256B1C1DA3B6138C50A7BC349147A702&tran_type=success&cardname=city"},{"name":"MTBL","type":"internetbanking","logo":"https://sandbox.sslcommerz.com/gwprocess/v4/image/gw/mtbl.png","gw":"mtbl","r_flag":"1","redirectGatewayURL":"https://sandbox.sslcommerz.com/gwprocess/v4/bankgw/indexhtmlOTP.php?mamount=4629.00&ssl_id=260129194751sP9QXo4BRVsgKnK&Q=REDIRECT&SESSIONKEY=256B1C1DA3B6138C50A7BC349147A702&tran_type=success&cardname=mtbl"},{"name":"Bank Asia","type":"internetbanking","logo":"https://sandbox.sslcommerz.com/gwprocess/v4/image/gw/bankasia.png","gw":"bankasia","r_flag":"1","redirectGatewayURL":"https://sandbox.sslcommerz.com/gwprocess/v4/bankgw/indexhtmlOTP.php?mamount=4629.00&ssl_id=260129194751sP9QXo4BRVsgKnK&Q=REDIRECT&SESSIONKEY=256B1C1DA3B6138C50A7BC349147A702&tran_type=success&cardname=bankasia"},{"name":"VISA-Eastern Bank Limited","type":"visa","logo":"https://sandbox.sslcommerz.com/gwprocess/v4/image/gw/visa.png","gw":"ebl_visa","r_flag":"1","redirectGatewayURL":"https://sandbox.sslcommerz.com/gwprocess/v4/bankgw/indexhtmlOTP.php?mamount=4629.00&ssl_id=260129194751sP9QXo4BRVsgKnK&Q=REDIRECT&SESSIONKEY=256B1C1DA3B6138C50A7BC349147A702&tran_type=success&cardname=ebl_visa"},{"name":"MASTER-Eastern Bank Limited","type":"master","logo":"https://sandbox.sslcommerz.com/gwprocess/v4/image/gw/master.png","gw":"ebl_master","r_flag":"1","redirectGatewayURL":"https://sandbox.sslcommerz.com/gwprocess/v4/bankgw/indexhtmlOTP.php?mamount=4629.00&ssl_id=260129194751sP9QXo4BRVsgKnK&Q=REDIRECT&SESSIONKEY=256B1C1DA3B6138C50A7BC349147A702&tran_type=success&cardname=ebl_master"},{"name":"VISA-City Bank","type":"visa","logo":"https://sandbox.sslcommerz.com/gwprocess/v4/image/gw/visa.png","gw":"city_visa","r_flag":"1","redirectGatewayURL":"https://sandbox.sslcommerz.com/gwprocess/v4/bankgw/indexhtmlOTP.php?mamount=4629.00&ssl_id=260129194751sP9QXo4BRVsgKnK&Q=REDIRECT&SESSIONKEY=256B1C1DA3B6138C50A7BC349147A702&tran_type=success&cardname=city_visa"},{"name":"MASTER-City bank","type":"master","logo":"https://sandbox.sslcommerz.com/gwprocess/v4/image/gw/master.png","gw":"city_master","r_flag":"1","redirectGatewayURL":"https://sandbox.sslcommerz.com/gwprocess/v4/bankgw/indexhtmlOTP.php?mamount=4629.00&ssl_id=260129194751sP9QXo4BRVsgKnK&Q=REDIRECT&SESSIONKEY=256B1C1DA3B6138C50A7BC349147A702&tran_type=success&cardname=city_master"},{"name":"TAP","type":"mobilebanking","logo":"https://sandbox.sslcommerz.com/gwprocess/v4/image/gw/tap.png","gw":"mobilemoney","r_flag":"1","redirectGatewayURL":"https://sandbox.sslcommerz.com/gwprocess/v4/bankgw/indexhtmlOTP.php?mamount=4629.00&ssl_id=260129194751sP9QXo4BRVsgKnK&Q=REDIRECT&SESSIONKEY=256B1C1DA3B6138C50A7BC349147A702&tran_type=success&cardname=mobilemoney"},{"name":"upay","type":"mobilebanking","logo":"https://sandbox.sslcommerz.com/gwprocess/v4/image/gw/upay.png","gw":"upay","r_flag":"1","redirectGatewayURL":"https://sandbox.sslcommerz.com/gwprocess/v4/bankgw/indexhtmlOTP.php?mamount=4629.00&ssl_id=260129194751sP9QXo4BRVsgKnK&Q=REDIRECT&SESSIONKEY=256B1C1DA3B6138C50A7BC349147A702&tran_type=success&cardname=upay"},{"name":"okaywallet","type":"mobilebanking","logo":"https://sandbox.sslcommerz.com/gwprocess/v4/image/gw/okwallet.png","gw":"okaywallet","r_flag":"1","redirectGatewayURL":"https://sandbox.sslcommerz.com/gwprocess/v4/bankgw/indexhtmlOTP.php?mamount=4629.00&ssl_id=260129194751sP9QXo4BRVsgKnK&Q=REDIRECT&SESSIONKEY=256B1C1DA3B6138C50A7BC349147A702&tran_type=success&cardname=okaywallet"},{"name":"cellfine","type":"mobilebanking","logo":"https://sandbox.sslcommerz.com/gwprocess/v4/image/gw/cellfin.png","gw":"cellfine","r_flag":"1","redirectGatewayURL":"https://sandbox.sslcommerz.com/gwprocess/v4/bankgw/indexhtmlOTP.php?mamount=4629.00&ssl_id=260129194751sP9QXo4BRVsgKnK&Q=REDIRECT&SESSIONKEY=256B1C1DA3B6138C50A7BC349147A702&tran_type=success&cardname=cellfine"},{"name":"mcash","type":"mobilebanking","logo":"https://sandbox.sslcommerz.com/gwprocess/v4/image/gw/ibblmobile.png","gw":"ibbl_m","r_flag":"1","redirectGatewayURL":"https://sandbox.sslcommerz.com/gwprocess/v4/bankgw/indexhtmlOTP.php?mamount=4629.00&ssl_id=260129194751sP9QXo4BRVsgKnK&Q=REDIRECT&SESSIONKEY=256B1C1DA3B6138C50A7BC349147A702&tran_type=success&cardname=ibbl_m"},{"name":"tapnpay","type":"internetbanking","logo":"https://sandbox.sslcommerz.com/gwprocess/v4/image/gw/tapnpay.png","gw":"tapnpay","r_flag":"1","redirectGatewayURL":"https://sandbox.sslcommerz.com/gwprocess/v4/bankgw/indexhtmlOTP.php?mamount=4629.00&ssl_id=260129194751sP9QXo4BRVsgKnK&Q=REDIRECT&SESSIONKEY=256B1C1DA3B6138C50A7BC349147A702&tran_type=success&cardname=tapnpay"},{"name":"eblsky","type":"internetbanking","logo":"https://sandbox.sslcommerz.com/gwprocess/v4/image/gw/eblsky.png","gw":"eblsky","r_flag":"1","redirectGatewayURL":"https://sandbox.sslcommerz.com/gwprocess/v4/bankgw/indexhtmlOTP.php?mamount=4629.00&ssl_id=260129194751sP9QXo4BRVsgKnK&Q=REDIRECT&SESSIONKEY=256B1C1DA3B6138C50A7BC349147A702&tran_type=success&cardname=eblsky"},{"name":"instapay","type":"internetbanking","logo":"https://sandbox.sslcommerz.com/gwprocess/v4/image/gw/instapay.png","gw":"instapay","r_flag":"1","redirectGatewayURL":"https://sandbox.sslcommerz.com/gwprocess/v4/bankgw/indexhtmlOTP.php?mamount=4629.00&ssl_id=260129194751sP9QXo4BRVsgKnK&Q=REDIRECT&SESSIONKEY=256B1C1DA3B6138C50A7BC349147A702&tran_type=success&cardname=instapay"},{"name":"pmoney","type":"internetbanking","logo":"https://sandbox.sslcommerz.com/gwprocess/v4/image/gw/pmoney.png","gw":"pmoney","r_flag":"1","redirectGatewayURL":"https://sandbox.sslcommerz.com/gwprocess/v4/bankgw/indexhtmlOTP.php?mamount=4629.00&ssl_id=260129194751sP9QXo4BRVsgKnK&Q=REDIRECT&SESSIONKEY=256B1C1DA3B6138C50A7BC349147A702&tran_type=success&cardname=pmoney"},{"name":"woori","type":"internetbanking","logo":"https://sandbox.sslcommerz.com/gwprocess/v4/image/gw/woori.png","gw":"woori","r_flag":"1","redirectGatewayURL":"https://sandbox.sslcommerz.com/gwprocess/v4/bankgw/indexhtmlOTP.php?mamount=4629.00&ssl_id=260129194751sP9QXo4BRVsgKnK&Q=REDIRECT&SESSIONKEY=256B1C1DA3B6138C50A7BC349147A702&tran_type=success&cardname=woori"},{"name":"modhumoti","type":"internetbanking","logo":"https://sandbox.sslcommerz.com/gwprocess/v4/image/gw/modhumoti.png","gw":"modhumoti","r_flag":"1","redirectGatewayURL":"https://sandbox.sslcommerz.com/gwprocess/v4/bankgw/indexhtmlOTP.php?mamount=4629.00&ssl_id=260129194751sP9QXo4BRVsgKnK&Q=REDIRECT&SESSIONKEY=256B1C1DA3B6138C50A7BC349147A702&tran_type=success&cardname=modhumoti"},{"name":"fsibl","type":"internetbanking","logo":"https://sandbox.sslcommerz.com/gwprocess/v4/image/gw/FsiblCloudLogo.png","gw":"fsibl","r_flag":"1","redirectGatewayURL":"https://sandbox.sslcommerz.com/gwprocess/v4/bankgw/indexhtmlOTP.php?mamount=4629.00&ssl_id=260129194751sP9QXo4BRVsgKnK&Q=REDIRECT&SESSIONKEY=256B1C1DA3B6138C50A7BC349147A702&tran_type=success&cardname=fsibl"}],"is_direct_pay_enable":"0"}	2026-01-29 13:47:48.39	2026-01-29 13:47:51.871
837ac2a6-1297-41d3-9ed5-f9ece40eb1ef	eb2d3655-d7d6-43e5-b2d5-490022482f94	\N	cod	94124.7	pending	\N	2026-01-29 14:14:18.097	2026-01-29 14:14:18.097
273f6514-ba0e-4317-9c2b-890460323550	8f803d36-fd5f-4cf1-a305-c3cd10064983	\N	cod	22126	pending	\N	2026-02-05 06:24:48.967	2026-02-05 06:24:48.967
69e5470c-d4ff-4b68-9dc9-62ab980d54d9	0264eab4-a533-4d31-a2f7-1649909d962c	\N	cod	32130	pending	\N	2026-02-05 06:27:12.461	2026-02-05 06:27:12.461
\.


--
-- Data for Name: PayoutRequest; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PayoutRequest" (id, "userId", amount, status, method, details, "adminNote", "processedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PointsTransaction; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PointsTransaction" (id, "userId", "loyaltyId", type, points, description, "orderId", "expiresAt", "createdAt") FROM stdin;
dd7ce607-ff1c-4f2a-a9f9-2070885d827c	4657508a-a0fd-433b-87f8-9fd906b61ddf	48184f45-ec87-4895-a56a-85a9f782c738	earned	941	Points earned from order #CTG1769696051827662	eb2d3655-d7d6-43e5-b2d5-490022482f94	\N	2026-01-29 14:17:12.906
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Product" (id, name, slug, description, "categoryId", "sellerId", "basePrice", "salePrice", images, "isFeatured", "isBestseller", "isActive", "sizeGuide", "hasWarranty", "warrantyPeriod", "createdAt", "updatedAt", "shopId") FROM stdin;
772e35d6-4ea7-48c2-8472-68b387ab485e	Premium Cotton T-Shirt	premium-cotton-tshirt	Comfortable and stylish cotton t-shirt perfect for everyday wear. Made from 100% premium cotton with excellent breathability.	354a6bf0-d94d-4f20-a99e-84e54c20d27a	\N	899	699	["/images/products/tshirt.png"]	t	t	t	\N	f	\N	2025-12-20 17:08:19.573	2025-12-20 17:08:19.573	\N
aa0cc819-ddaf-4ce6-a982-7fac11f1c1f1	Floral Summer Dress	floral-summer-dress	Elegant floral dress perfect for summer outings. Lightweight and breathable fabric with beautiful floral patterns.	354a6bf0-d94d-4f20-a99e-84e54c20d27a	\N	2499	1999	["/images/products/dress.png"]	t	f	t	\N	f	\N	2025-12-20 17:08:21.672	2025-12-20 17:08:21.672	\N
97b76d3b-f5d0-4009-b76b-9bed6a1b47fe	Classic White Sneakers	classic-white-sneakers	Versatile white sneakers with blue accents. Comfortable cushioning and durable construction for all-day wear.	354a6bf0-d94d-4f20-a99e-84e54c20d27a	\N	3499	2799	["/images/products/sneakers.png"]	f	t	t	\N	f	\N	2025-12-20 17:08:23.478	2025-12-20 17:08:23.478	\N
f3d8b2bf-bf4d-49aa-ac0f-06571e533af0	Leather Backpack	leather-backpack	Premium black leather backpack with multiple compartments. Perfect for work, travel, or daily use.	354a6bf0-d94d-4f20-a99e-84e54c20d27a	\N	4999	3999	["/images/products/backpack.png"]	t	f	t	\N	f	\N	2025-12-20 17:08:25.06	2025-12-20 17:08:25.06	\N
36b8ee03-6700-493c-8494-82880cb58b28	Luxury Skincare Set	luxury-skincare-set	Complete skincare routine with cleanser, toner, serum, and moisturizer. Premium ingredients for radiant skin.	d0c90871-5651-409f-b847-71c412cfda85	\N	7999	6499	["/images/products/skincare.png"]	t	t	t	\N	f	\N	2025-12-20 17:08:32.389	2025-12-20 17:08:32.389	\N
8f22150c-6147-4b31-95d4-1f472f2b211e	Eau de Parfum	eau-de-parfum	Elegant fragrance with floral and woody notes. Long-lasting scent in a beautiful crystal bottle.	d0c90871-5651-409f-b847-71c412cfda85	\N	5999	4999	["/images/products/perfume.png"]	t	f	t	\N	f	\N	2025-12-20 17:08:33.67	2025-12-20 17:08:33.67	\N
91e2f478-cc33-447d-b965-bb356e164a55	dora	dora	Discover the serene charm of the 'dora' from CTG Collection, a garment designed to bring effortless grace to your everyday. Crafted from a premium, breathable fabric, its gentle drape offers unparalleled comfort and	d0c90871-5651-409f-b847-71c412cfda85	591ddf6b-acf5-4e79-b069-a31a1ea7879d	3000	\N	["data:image/jpeg;base64,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","data:image/jpeg;base64,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"]	f	t	t	\N	f	\N	2026-01-03 05:39:19.097	2026-01-03 05:40:14.629	\N
81832d55-7f0f-413f-a256-d6d4f5dc6a1f	Modern Desk Lamp	modern-desk-lamp	Minimalist desk lamp with adjustable brightness. Energy-efficient LED with touch controls.	e3016401-9c58-4801-b1e2-b123701595c1	\N	2499	1899	["/images/products/lamp.png"]	f	f	t	\N	f	\N	2025-12-20 17:08:30.842	2025-12-20 20:53:36.066	\N
99e934ec-c57c-4008-984d-b46eccfb56fe	Wireless Bluetooth Headphones	wireless-bluetooth-headphones	Premium wireless headphones with active noise cancellation. 40-hour battery life and superior sound quality.	76e055d8-a8e8-4e3b-8299-b4e692985d2b	\N	5999	4499	["/images/products/headphones.png"]	t	t	t	\N	f	\N	2025-12-20 17:08:26.596	2025-12-20 20:53:58.727	\N
66ff844c-3640-416f-89e3-73458c28bf88	Stainless Steel Coffee Maker	stainless-steel-coffee-maker	Modern coffee maker with programmable settings. Makes perfect coffee every time with 12-cup capacity.	e3016401-9c58-4801-b1e2-b123701595c1	\N	6499	5499	["/images/products/coffee.png"]	f	t	t	\N	f	\N	2025-12-20 17:08:29.46	2026-01-29 13:34:11.869	\N
2c66ca09-e6a2-4212-897c-e35330609585	Smartphone Pro X	smartphone-pro-x	Latest flagship smartphone with 6.5" AMOLED display, 128GB storage, and advanced camera system.	76e055d8-a8e8-4e3b-8299-b4e692985d2b	\N	45999	42999	["/images/products/smartphone.png"]	t	f	t	\N	f	\N	2025-12-20 17:08:27.881	2026-01-29 13:57:31.444	\N
200941ef-0be8-4e83-816c-ce102d396b86	Atar AL Kaba | Sacred Fragrance | CTG Collection	atar-al-kaba-sacred-fragrance-ctg-collection	Experience divine tranquility with Atar AL Kaba, a sacred fragrance meticulously crafted to evoke the spiritual essence of the Holy Kaba. This exquisite attar blends rich, traditional notes with a captivating modern touch, offering a long-lasting and profound aroma. Part of our exclusive CTG Collection, it represents a unique fusion of spiritual heritage and local craftsmanship, perfect for those seeking a truly unique and meaningful scent.\n\nAtar AL Kaba, sacred fragrance, attar, Islamic perfume, non-alcoholic perfume, oud, musky fragrance, spiritual scent, Chittagong collection, premium attar, Bangladeshi perfume, fragrance oil	d0c90871-5651-409f-b847-71c412cfda85	591ddf6b-acf5-4e79-b069-a31a1ea7879d	10000	7500	["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAJQAlAMBIgACEQEDEQH/xAAbAAABBQEBAAAAAAAAAAAAAAAGAAIDBAUBB//EAEMQAAIBAwMBBAcEBgYLAAAAAAECAwAEEQUSITEGE0FRFCJSYXGBkRUyQqEjM1OxssEHFmKC0fAkJUNkcnSSk6LC4f/EABkBAQEBAQEBAAAAAAAAAAAAAAABAgMEBf/EACMRAAICAgICAgMBAAAAAAAAAAABAhEDEgQhEzFBUSJCkWH/2gAMAwEAAhEDEQA/ANwmm7q5XM1g0O3VzNNzSzQDs0s1HuruaAfmlmmZpZoCQGnqagDU9TQEua6DUeacGqgkBpwNRBqcDSgSA13NMBpZoCQGu5qMGug0A/NKmFqVAVTTGp5qJzQHC1c3CsrtDM8Wi6g8TsjrbSFWU4KnacEGvLU1zV1GPtK6I/tSlv30oHsu7y5pbj5H6V4xLq17NgzSmQjxLsv8JFRi7iJzPa94cftm/nmpTFns7XCL951HxNRvf2yH17mFT/akUfzryCLUzCjJBF3anwXaCPmADTftA7w6xMrAYyJTSmLPWn1rTY895qFouOoM65/fUZ7SaOmd+p2o93eivKm1EsQ3cLuHjvP8qeus3cf6oRp4fiOPhk8Upg9SXtVoZOPtS2+b1fh1SymGYrqFvg4rxZr24cksTk9cSOP/AGqxbadd3FrLfQRRd3EJGeQt6w2BSepz+NarIe1LICMg5HnUqvXhqarqUP6m9mT/AITXo/8AR9f3d/o8st9cPPILhlDP1xtXj8zTsoXhq7molNPzQD67mmZruaA7mlTaVClNrhPOoJbkeFUQTSJpYM/tJOTo9+PO3k/hNeXCvSe0R/1Te/8ALv8AwmvNlqoyx1NIp3hXDVAwDmpoVTvU3ruUsNwDhcjPPrHgfE9KiXrRdoXZ22v7RbgW9xcEWjyvmcJH3vr7Y1AG5idozyNvjnocykoq2VKxsml6DbabcPJdytK0cZbuzBM1u+4FkX9Ipc4ZVJA4w3vAoPPoKaVPaWkFzJezMu27uokURDep42u20YDA4BJz5cVXt7RJF9CSCOa6lMIW89IxFDvCsFOBjPJByeuQBkclljpEi3E9vcWdgdStGWSG1ihZ4UiIGZAOO9fPG2RvDjwrlJqPtml36B5m7PWklviK8uZYUjMrwyp3MkgALcOhyM8eRx5dZJ+0FotpeWun6UbaK677Ktchghk2fdAQYA7sYHv61p39tYxaZb37QxxTSmFJpry3LMSe/VnMZz65aMN4jPnzSv8ARL2602DULKy0+BZbGH0m27vu3ZxJzhQPV3ELyCDjgVNodWWn8AWa9D/o3k26LMP95b+FaFe1dolpfxiK8trlTEEJtoxGkbKAGULknyOTjJJ4oi/o/P8AqeX/AJlv4VrtdqzFU6DpJhipVkHnWTvxTlnI8allNYNmnA1nxXOatpIDVBLmlTM12gMAuB41BLcKPGqbTk+NQsxNQHb9DfW8tsCQZkMYIGcZGOlDEnZDU1JFu9tct7EchBHx3AAfWiJmADFnVBg+szAAcdST0rUADFpMRywlsp3qEK5P4RnqDny+fhXOU3H0VJM86m0XVIAS+n3BUdXiTvFH95cj86ziRkrkZHUV66FCOFuA4ZTlIpOdq+e0HA6+A92fCobqNLlHW57ucK4UtPF3yr7wpIH06fDiizfaGh5QOta+n65dadYta2vqbpTK0gmlU5wAMBWUcYzyDz9KMBo+mBXYWcCkMVJ7hG55/DsIz6p4Hu8DmtK20S1F1IIrbTcREblOmoH2nphg3PlnHXnGKSyxfTQUWgIj7bavGoD3gZ+8DFxhMr4rhQF549YgkY4NNuu1N3qEkgJuGjMQWGFbyRlik4/SebNkZGTwa9BtY4QFO1osEqe6DgEBgB0OPHJ6eJ4pWpka0hc310C0CkI7oyltgPUrnPxJzz7qxtBdqJaf2BS6jf8A2fG9jY6vJrDKElvJI2kCgM5DJ1O/D7cnoMgdc1q6DqWsfbbR3em64NPuWCevNN3kOQACGchcZ5PAOCeeK3mWJ5lWW3JQRoxkUKvUMME7geoXnzPJ5xUU0Ucuq2+lxAhruT9JhiFSL8Q2l1AyPdxz4njMpRppo1FOyv8A0gWj39jFBawNc3RmcrIZIYlRd2cYOCTxgHyJyWNUux1lcWGmPFdoqO0zMAsiuCMAdVJHUGiq+0y0OnXVzYpDK1tO8ksCsjloWPK/rMAL1XIOOQOtZsYTmSJg6SnerAYJ+I6g+HP7qYJVHQZF3aJSajJrrGmZr0HMmjbmr0L1nRnmrkTVoFzfSqHd76VACQNImmBq6TUBXvYxPazQlgveRsuScAZFBFrPPZylraaW3l6ExOUb8qPFfZIrbN/9jIG73c1X0l9Pu7OX9Epja4csBAZsHP3iApAzwckdOBU2r4FGFa9p9Xtxt9K71D1EijLfFxh//KtKDtkcr6ZYA4IJ7iUqvzQ/e6Dq30q6ez2lX8bvZd2zf7rPnB/tEblA9wUViax2cexhM0E5l9dV7spgnJwMMDzyR4Dr8an4Mdo1/wCuFiCMLd45Oz0aLacgj289GIx0+dKftpavvY6bJM7beXlCdBjp63v+prJ1DRc2wNpb3CTW0YDh4CvpAzjvE8+h+WKg0nQbnUrb0lZI44ckAnlmx1IHiB4nPnRRg1Ybka57bzDPd2bjLbsNcgjPyjGfPnzNQydtb5mJWyseTn11diPPkMPKo4+yksn3Z5ivtrFCVP0mzz4ceIqzH2QVl5kmLjGQzCLB8edrjjnPPh8KVjQ/IpydsNVbOwW8Z27cqHOBzj7zkeJ+texdk45dS0Ww1cSCG4ubbLmNcNknwbrj3fnXnum9gYZyxunlj2ru4n3KPZ3HulwDjrR32cQaBZRaUHdVd8R95PlYsgnALZ8s/E/XwcyeOcNYPs9GKM07fo0bKwuo2kV71tjDG1dw+uWOaGtbiNrqL227ckaqEPGcEZ8B5k/LFX9O1DV5b67t2bcYo8wo5Ve8bw52Dgjx99Q/ZJvXllk9LgvpyZGWYNJEWx90Pzs6DA6D3V5+I9Ml5GdMkXKPRjsaZuqS7hltJmhnUBx5MCPqKr5r66dnkLCHmrkLVnoatxGtELeaVR5pVQCCyDzp5cYqH7M1deunXHyTNI2epr10+7/7Lf4VAQ6nIVsbkocHumwflQcnDKw4ZTkEdRRXqUF6tlcGWzuUURNlmhYADHwoUFaiRmgmrXodWlmFwV6G5QSMPcGPrD5EVbk7S3TWwjCsGDA5MrOvBz0fLeGPv4x4Vi1w01RLDbWNceO2gnZbbckKpYhWZi4yhLt0A4VOPMVmaZ2qms7NoJrfv3MjOsokCEFjluNpBOSfrQ9JI8hTvHZtiBFyeijoKls1hkuoEupe5t2kUSyBSdq55IABJOKyscYqjTk2b39brr9nK58O8mXA+SRrxXoHYrU9P1HThJauxvYhvuElZpGjPGfVYnMZOcMuMZAOMZrz29l7MrdW09jG7W4jl721ZX3bmRtnrNkcMQMjPTPNaVh2s0HRdR9K07Tp45EEoRwkalg7BgCM8bcbR7s9M1wzY/JCkmahLV2z0jVYUkSSK2hR50cNtm3qgwCd3ByRyOh/mCzUrZ/sy3a0srOS6P6QLOu7CnABUetjOC3ngr1NSve21/Yd7uMQcASKcZQZG4DwVuuR0zyOeudrHam0gvJZbP0aRmJBzJJgg4GMqvAGOnTpXyo45RdH0YqUqpWT77ySYRSR+hb3Kw9wBukULlwQR6uDxk/4Up49VisDDDq8PfKN8npMADOScDIIwo+R8ORk1izds5y7Na29pCz9dsBkz7uSP8/Sqv8AWPVtn+j95AirtIgjSMAeAxtJAHlmteJr6O6w5n+v9oKbrTZ7m0kkaN3uGJI7zcFHXALEePHIPyPiOXVs9s7K2Djrg5/Px/znHSqon1G5l33TygHn1pnx9N2PyqhdapF3rLFs29C4UAv7yfGvVxdk6TtHj5WHxq5VZqxtVuJqHU1RB1NWItXiH4q+ieEIwwxSrEXWYcfeFdoA071POuGVPOottc2A+FYstGb2okRuz+phTkm1lwP7prxdSD0Oa9yvIVMTKDtLAjPlQtqfZ1blmeS0t7nOSWX9FIP7y/uIPxp5Nfga2eb1w0TXnZZRG8trdGIIcNHd4GP765AHxArFvdKv7Jd9xbOI/CVPXQjz3DitRywl6ZlxaKPiPgKOtL7PWeqdnYXhtHheWeGP0l0YyNl1WRuu0Ll8AAdFJJPOAXcoOcjp51aS7vJ1jjS4upFiXbGiyM2wZHAHgMhfoPKrOLa6dCLSDbSezOgXNsszvM6StkPPJ3WxO+ZR49dsbDn8j0Zol7ZxaTqBSWx06Bu8S0i9JDPIwy29yeW5VVXoME8HjIcml6hMQE066by/QN+/FWl7O6w3IsHA82dF/ea4yhH9pG038I9N7OalFrDX1oNQs+9ivp1tl7wM1xBuJBIznAzgHpgAdBWPPpWpG6futNm3I5jO5PV646nj50OaR2d1u11C2vbQ2iz28iyoGmzyDnkL1Hnjwr0/Ubi3F1DMsUkxmiMckgJOBkEZJ6c+fhXg5Ljjf4O7PocPPONqgIks9Qi3BItyIA5aEBlx8R1x/Ly5q1baNqU5LTuYkGXlHeDeqgZyVyPz488UWJKZZXEocPnajNjJB/EDjoOD40l9MluYk7mMosxBdxIQU6MSc7QcHA6eNeVchydJKz3vlyr0hujdnzazGZruKVEJVVSM+twCCSehwQfHyra9HX2fyrREAGcKBnk8daRhr7GDH440z4ebK8stmZvo6H8I+lOFtH+zX6Vf7n3Vzu67nEoG1h/ZJ/0iu1cKUqhTPOm3PsiufZ1z7FFsJBU555rpCeyPpU1FgPdaddtgCP8AOqw0y8H+z/Ojx44z+EVEYIj+GmpQIfSppTmW3ViOjHqPgaqHssN5kgJt5CcnDcN8QOvzzR89tEfP61A9gjfjYViUE/YTaAK37IXAlZv9ATP4lXLH3/d61ojszNjD6ntHHqpHj+Yoo+yx4TMPlUb6TJ+GcH4jFc/DH6NbsH17LWjKUnv7h1PUBuvOfHNPbQNKsVFyLiZniGVEjLjPyUVs/Zdwp42t8DXHsJCpWSEsp6jGajgq6RU/9Blp4Y2AijRF3bmdFHJPXcep6561xZogxdVVoGUZTPj589P/ALWrc6LAN2yPYW6gdD8qz10ue2DbEMi54Ax08uvPBr5mXjzvrs9cMka7JzeIkZKQLvBwA0h4Hvx0+lRy37MpxCAB4CPrzg+t4/AZrltDlQ7MYWOQdy7TyfGtG10uOfa6vLON2MRjwrjHjSs08kS7Z6g8QRrkZtG6TgcJ/wAXl8/qelbccayxrJGQyMMgjoRVS00SPGZYpDg+qGcj4dDWnGpQbAuFUYFfX47yJVI8eRRvorm391NMGPCr2KcEr1HIyzAM9RSrU7rNKqCtbIzI2AOvnUvcyez+YoDfWbhSRuI+dcGtXPg7fWpuhow7MEvs/nTDBN7H50Eprt1n77fWr0Oq3LrkSt9amyLqwm7iX2DS7iX9maFZtbvImx3jH50wdorv22+tNkXVhd3UnsGuiN/YNDdvrlxJwZGq0dSuMZEhpaFM3Ajeya7sPkaGptXukGQ5+tVjr91nlmqWhqwseCOQFZEyKYljaJ/sc/Ek0NR63cN1dqlOqXGM72qOhTCVY4k+5Cg+C0/efAUInW7hfxGm/wBYJh1c1KReww3t5GmlnPgaE012ZjgSNT5NauIxkynFW0SmFHr+RqRe89lvpQeO0U/hMa63aK7QZ7w4rWyGrDHL+y30pUMQdobh4w2+lV2RKYK3H6w0wdKVKuLOol61q2Q9WlSoiMj1BRnNURSpUYRdtPvCtNfu0qVVAgnAINZxHNKlQIlh6iroHq0qVECpN1qtKOBSpVllO249arsqgwnI8KVKqiGQFAc1JP8AqqVKoiliy/UD40qVKtkP/9k=","data:image/jpeg;base64,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","data:image/jpeg;base64,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"]	t	t	f	\N	f	\N	2026-01-29 14:04:21.934	2026-01-29 14:04:33.82	\N
842e2dbf-90fb-4294-a0f3-99343a94e362	Atar AL Kaba | Sacred Fragrance | CTG 	atar-al-kaba-sacred-fragrance-ctg	Discover the Atar AL Kaba | Sacred Fragrance | CTG Collection from our Fashion collection. Crafted with premium quality materials for exceptional comfort and style. This product features modern design elements perfect for any occasion. Experience the perfect blend of functionality and elegance with CTG Collection.\n\natar, kaba, sacred, fragrance, ctg, collection, fashion, premium, quality, ctg collection, bangladesh, chittagong, online shopping	d0c90871-5651-409f-b847-71c412cfda85	591ddf6b-acf5-4e79-b069-a31a1ea7879d	10000	8000	["data:image/jpeg;base64,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","data:image/jpeg;base64,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","data:image/jpeg;base64,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","data:image/jpeg;base64,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"]	t	t	t	\N	f	\N	2026-01-29 14:08:26.305	2026-02-05 06:25:09.909	\N
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
9e6adec5-3668-4a30-a99f-5a72549a35e7	91e2f478-cc33-447d-b965-bb356e164a55	dora--			90	2026-01-03 05:39:19.097	2026-01-03 05:39:19.097
d6b2cbb1-4095-4da8-9ff7-dc5a9478beae	200941ef-0be8-4e83-816c-ce102d396b86	atar-al-kaba-sacred-fragrance-ctg-collection--			50	2026-01-29 14:04:21.934	2026-01-29 14:04:21.934
78f2ba4b-6431-4bdf-bb36-651ff7bc161b	36b8ee03-6700-493c-8494-82880cb58b28	SKN-LUX-SET	Full Set	Gold	37	2025-12-20 17:08:32.389	2026-01-29 14:14:17.445
fb0c4349-673b-431d-b1fa-1b4c25a7eb2a	99e934ec-c57c-4008-984d-b46eccfb56fe	HP-BLK-STD	Standard	Black	55	2025-12-20 17:08:26.596	2026-01-29 14:14:17.879
07be9327-a344-49dd-830d-4305c8a8bf43	66ff844c-3640-416f-89e3-73458c28bf88	COF-SS-12	12-Cup	Stainless Steel	31	2025-12-20 17:08:29.46	2026-02-05 06:24:48.066
321f0f85-b0f2-4ac4-8ff4-55550989e5d6	842e2dbf-90fb-4294-a0f3-99343a94e362	atar-al-kaba-sacred-fragrance-ctg--			35	2026-01-29 14:08:26.305	2026-02-05 06:27:11.583
3a79539f-4ad9-42ef-82f1-a26aaac80b3d	772e35d6-4ea7-48c2-8472-68b387ab485e	TSH-NVY-S	S	Navy	50	2025-12-20 17:08:19.573	2025-12-20 17:08:19.573
38c6b5a4-66dc-457d-9bc2-6bfb85693a32	772e35d6-4ea7-48c2-8472-68b387ab485e	TSH-NVY-M	M	Navy	75	2025-12-20 17:08:19.573	2025-12-20 17:08:19.573
6f7f23c0-b7e9-4c6c-bfb8-531e6a16b389	772e35d6-4ea7-48c2-8472-68b387ab485e	TSH-NVY-L	L	Navy	60	2025-12-20 17:08:19.573	2025-12-20 17:08:19.573
18c46be1-f05f-413b-8782-df531e2ab212	772e35d6-4ea7-48c2-8472-68b387ab485e	TSH-NVY-XL	XL	Navy	40	2025-12-20 17:08:19.573	2025-12-20 17:08:19.573
25520f65-74ae-46e2-b7e6-7a7d8229e0b3	aa0cc819-ddaf-4ce6-a982-7fac11f1c1f1	DRS-FLR-S	S	Floral	30	2025-12-20 17:08:21.672	2025-12-20 17:08:21.672
8ec331f6-0977-47f9-bd13-34c7d9e24bcc	aa0cc819-ddaf-4ce6-a982-7fac11f1c1f1	DRS-FLR-M	M	Floral	40	2025-12-20 17:08:21.672	2025-12-20 17:08:21.672
580ee5ae-239b-44e2-b9f3-bf5374080781	aa0cc819-ddaf-4ce6-a982-7fac11f1c1f1	DRS-FLR-L	L	Floral	35	2025-12-20 17:08:21.672	2025-12-20 17:08:21.672
e8f3429f-f1bf-4df8-913b-d0ba1bff867e	97b76d3b-f5d0-4009-b76b-9bed6a1b47fe	SNK-WHT-39	39	White/Blue	25	2025-12-20 17:08:23.478	2025-12-20 17:08:23.478
29c41746-bceb-4221-9b76-c9842db61f9e	97b76d3b-f5d0-4009-b76b-9bed6a1b47fe	SNK-WHT-40	40	White/Blue	30	2025-12-20 17:08:23.478	2025-12-20 17:08:23.478
7a241a61-cdc8-40c8-bcae-c330b51fe305	97b76d3b-f5d0-4009-b76b-9bed6a1b47fe	SNK-WHT-41	41	White/Blue	35	2025-12-20 17:08:23.478	2025-12-20 17:08:23.478
23e47de9-a48f-4f7f-94bc-143573edc169	97b76d3b-f5d0-4009-b76b-9bed6a1b47fe	SNK-WHT-42	42	White/Blue	30	2025-12-20 17:08:23.478	2025-12-20 17:08:23.478
430b0706-bff8-414d-a849-a59c853f047b	97b76d3b-f5d0-4009-b76b-9bed6a1b47fe	SNK-WHT-43	43	White/Blue	20	2025-12-20 17:08:23.478	2025-12-20 17:08:23.478
ac669af2-e655-49ec-bd45-62384ac3dd76	f3d8b2bf-bf4d-49aa-ac0f-06571e533af0	BAG-BLK-STD	Standard	Black	45	2025-12-20 17:08:25.06	2025-12-20 17:08:25.06
8fb12295-a739-4186-a8d4-cb8d927744f7	2c66ca09-e6a2-4212-897c-e35330609585	PHN-BLK-128	128GB	Black	20	2025-12-20 17:08:27.881	2025-12-20 17:08:27.881
89c0bf6a-8859-46bf-992e-90bf520f1f84	2c66ca09-e6a2-4212-897c-e35330609585	PHN-BLU-128	128GB	Blue	15	2025-12-20 17:08:27.881	2025-12-20 17:08:27.881
b8602f9f-e179-4998-8106-e05254dd5d32	81832d55-7f0f-413f-a256-d6d4f5dc6a1f	LMP-BLK-STD	Standard	Black	50	2025-12-20 17:08:30.842	2025-12-20 17:08:30.842
ca5cb5cf-5f28-4dda-a3db-e585befcc362	81832d55-7f0f-413f-a256-d6d4f5dc6a1f	LMP-WHT-STD	Standard	White	45	2025-12-20 17:08:30.842	2025-12-20 17:08:30.842
9e7a66f1-4aa5-43bd-817d-afeb2ff8a6de	8f22150c-6147-4b31-95d4-1f472f2b211e	PRF-EDP-50	50ml	Clear	55	2025-12-20 17:08:33.67	2025-12-20 17:08:33.67
8b339a39-8491-4269-aef8-39a3fa2ae797	8f22150c-6147-4b31-95d4-1f472f2b211e	PRF-EDP-100	100ml	Clear	30	2025-12-20 17:08:33.67	2025-12-20 17:08:33.67
\.


--
-- Data for Name: Referral; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Referral" (id, "referrerId", "referredId", "referralCode", status, "referrerBonus", "referredBonus", "completedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: RefundRequest; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."RefundRequest" (id, "orderId", "userId", amount, reason, images, status, "adminNote", "processedAt", "processedBy", "createdAt", "updatedAt") FROM stdin;
d7287eb6-e4d3-4fb4-8573-5a7f61af5c92	eb2d3655-d7d6-43e5-b2d5-490022482f94	4657508a-a0fd-433b-87f8-9fd906b61ddf	94124.7	Vulval 	[]	pending	\N	\N	\N	2026-01-29 14:18:05.983	2026-01-29 14:18:05.983
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Review" (id, "productId", "userId", rating, comment, photos, "isApproved", "adminReply", "adminReplyAt", "adminReplyBy", "createdAt", "updatedAt") FROM stdin;
06166f85-a9b5-4635-a87a-e09c09259a24	8f22150c-6147-4b31-95d4-1f472f2b211e	e56c7e4b-9d90-464f-aa5e-aebeb68dd3d2	5	Absolutely love this fragrance! Long-lasting and the scent is very elegant. Perfect for special occasions.	\N	t	\N	\N	\N	2025-11-30 17:08:37.112	2025-12-20 17:08:37.113
6eb09f0d-cddf-4263-8f96-a9a1496080d0	8f22150c-6147-4b31-95d4-1f472f2b211e	7c428dc4-c90e-4cf7-8cce-3e2285478c58	5	My favorite perfume now! The floral notes are beautiful and it stays all day. Great packaging too!	\N	t	\N	\N	\N	2025-12-08 17:08:37.641	2025-12-20 17:08:37.642
0c592cbf-8696-49ac-97a1-5585109fe88b	8f22150c-6147-4b31-95d4-1f472f2b211e	27d2ef7d-3edf-4520-8fe9-12aae61415cc	4	Very nice perfume. Bought it as a gift for my wife and she loved it. The price is reasonable for the quality.	\N	t	\N	\N	\N	2025-12-12 17:08:37.946	2025-12-20 17:08:37.947
7bc62753-29f7-441d-a8ef-8a0934603181	aa0cc819-ddaf-4ce6-a982-7fac11f1c1f1	7c428dc4-c90e-4cf7-8cce-3e2285478c58	5	Beautiful dress! The fabric is very comfortable and the print is exactly as shown. Perfect fit!	\N	t	\N	\N	\N	2025-12-02 17:08:38.203	2025-12-20 17:08:38.204
f2b63d0a-5599-414b-890c-7941ae3754c6	aa0cc819-ddaf-4ce6-a982-7fac11f1c1f1	c7adfa46-c7ee-4417-9c57-2eb06307677b	4	Nice summer dress. The color is vibrant and material is breathable. Took a bit longer to deliver but worth the wait!	\N	t	\N	\N	\N	2025-12-06 17:08:38.543	2025-12-20 17:08:38.544
239965b8-8305-49be-bbc1-be20b1269f02	aa0cc819-ddaf-4ce6-a982-7fac11f1c1f1	e56c7e4b-9d90-464f-aa5e-aebeb68dd3d2	5	Excellent quality dress! Very comfortable for hot weather. Received many compliments when I wore it!	\N	t	\N	\N	\N	2025-12-15 17:08:38.797	2025-12-20 17:08:38.798
040fe85f-85e0-4a42-b36d-063ccfa797f1	aa0cc819-ddaf-4ce6-a982-7fac11f1c1f1	6a36964a-528e-47b9-9fab-58af0c6e7419	3	Good dress but the size runs a bit small. Material quality is nice though. Would recommend sizing up.	\N	t	\N	\N	\N	2025-12-18 17:08:39.052	2025-12-20 17:08:39.053
\.


--
-- Data for Name: SellerApplication; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SellerApplication" (id, "userId", "shopName", "shopDescription", category, "nidNumber", "nidImage", "passportNumber", "passportImage", "bankName", status, "rejectionReason", "createdAt", "updatedAt", "accountName", "accountNumber", "bkashNumber", "nagadNumber", "routingNumber") FROM stdin;
\.


--
-- Data for Name: Shop; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Shop" (id, "ownerId", name, slug, description, logo, banner, phone, email, address, city, "isVerified", "isActive", rating, "totalSales", "totalProducts", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SiteSetting; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SiteSetting" (id, key, value, "createdAt", "updatedAt") FROM stdin;
26b4b2ee-a185-4179-88c3-6fc052bec4d8	receiptTemplate	6	2025-12-19 00:29:27.269	2026-02-05 11:39:55.684
\.


--
-- Data for Name: SiteSettings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SiteSettings" (id, "storeName", "storeTagline", "storeDescription", "storeEmail", email2, "storePhone", phone2, "storeAddress", "addressLine2", "workingDays", "workingHours", "offDays", facebook, instagram, twitter, youtube, linkedin, whatsapp, "aboutTitle", "aboutContent", "aboutMission", "aboutVision", "footerAbout", "copyrightText", "metaTitle", "metaDescription", "metaKeywords", "googleMapsEmbed", "chatStatus", "promoEnabled", "promoCode", "promoMessage", "promoEndTime", "shippingCost", "freeShippingMin", "codEnabled", "sslEnabled", "pointsPerTaka", "pointsValue", "unifiedLogin", "updatedAt", "bkashEnabled", "bkashNumber", "multiVendorEnabled", "nagadEnabled", "nagadNumber", "rocketEnabled", "rocketNumber", "couponCostPolicy", "defaultCommission", "spinWheelConfig", logo, "stat1Label", "stat1Value", "stat2Label", "stat2Value", "stat3Label", "stat3Value", "stat4Label", "stat4Value", "value1Desc", "value1Title", "value2Desc", "value2Title", "value3Desc", "value3Title", "value4Desc", "value4Title", "returnsEnabled", "featureAuthenticDesc", "featureAuthenticTitle", "featureCODDesc", "featureCODTitle", "featureReturnDesc", "featureReturnTitle", "featureShippingDesc", "featureShippingTitle", "showAuthentic", "showCOD", "showEasyReturns", "showFreeShipping") FROM stdin;
main	Silk Mart	Fragrance, Beauty & Lifestyle – Essentials for Everyone.	Discover a curated world of premium perfumes, authentic attars, beauty essentials, and lifestyle products. From signature scents to kids' toys, we bring you quality products at the best prices, delivered right to your doorstep.	ctgcollection44@gmail.com	sanim1728@gmail.com	+8801991523289	+8801410002899	House: 06 ,Block A, Halishahar, Chittagong	\N	Sat - Thu	9AM - 9PM	Friday: 3PM - 9PM	\N	\N	\N	\N	\N	\N	About Silk Mart 	Welcome to our store, your ultimate destination for premium fragrances and lifestyle essentials in Bangladesh. We specialize in an exquisite collection of imported perfumes, long-lasting attars, and pure perfume oils that define elegance and class. But we are more than just a fragrance store. We pride ourselves on being an all-rounder shop, offering a diverse range of high-quality beauty creams, skincare products, trendy lifestyle accessories, and engaging toys for children. Whether you are looking for a signature scent, a daily skincare routine, or the perfect gift for a loved one, we have carefully selected items to meet your every need.	To provide authentic, high-quality fragrances and lifestyle products that enhance your daily life. We are committed to offering the best prices, genuine products, and an exceptional shopping experience for every customer.	To become the most trusted one-stop online store for personal care and lifestyle needs in Bangladesh, known for our variety, authenticity, and customer-first approach.	Your one-stop shop for premium perfumes, authentic attars, beauty care, and lifestyle essentials. Quality products, best prices, and fast delivery nationwide.	© 2026 Silk Mart. All rights reserved.	Silk Mart | Premium Perfumes, Attar, Beauty & Lifestyle Shop	Shop the best collection of branded perfumes, attar, perfume oils, beauty creams, toys, and lifestyle products in Bangladesh. Authentic products & fast delivery.	perfume price in bd, attar shop bangladesh, perfume oil, online lifestyle shop, kids toys bd, beauty products, skincare bangladesh, best online shop bd	<iframe src="https://www.google.com/maps/embed?pb=!1m10!1m8!1m3!1d230.63997720380334!2d91.77670091084892!3d22.344578779108137!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sbd!4v1770292852822!5m2!1sen!2sbd" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>	online	t	WELCOME10	🎉 Use code WELCOME10 for 10% OFF	\N	60	2000	t	t	0.01	0.1	t	2026-01-29 13:36:39.006	t	01991523289	f	t	01991523289	t	01991523289	platform	5	{"prizes": [{"id": "1", "code": "SPIN5", "color": "#FF6B6B", "label": "5% OFF", "probability": 25}, {"id": "2", "code": "SPIN10", "color": "#4ECDC4", "label": "10% OFF", "probability": 20}, {"id": "3", "code": "FREESHIP", "color": "#45B7D1", "label": "Free Ship", "probability": 15}, {"id": "4", "code": "SPIN15", "color": "#96CEB4", "label": "15% OFF", "probability": 10}, {"id": "5", "code": "", "color": "#DDA0DD", "label": "Try Again", "probability": 20}, {"id": "6", "code": "SPIN20", "color": "#FFEAA7", "label": "20% OFF", "probability": 5}], "enabled": true, "delaySeconds": 10, "cooldownMinutes": 1440}	\N	Products Sold	10,000+	Happy Customers	5,000+	Brands	100+	Average Rating	4.8	We carefully select every product to ensure the highest quality standards.	Quality First	Nationwide delivery within 2-5 business days.	Fast Delivery	Our customers are at the heart of everything we do.	Customer Love	Proudly serving Bangladesh with the best local and international products.	Local Pride	t	Genuine products	100% Authentic	Cash on Delivery	COD Available	7-day return policy	Easy Returns	Orders over BDT 2,000	Free Shipping	t	t	t	t
\.


--
-- Data for Name: Testimonial; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Testimonial" (id, "userId", name, email, avatar, content, rating, location, "isApproved", "isFeatured", "createdAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, email, password, name, phone, role, "isActive", "createdById", "googleId", "referralCode", "emailVerified", "verificationToken", "verificationExpiry", "twoFactorEnabled", "twoFactorMethod", "createdAt", "updatedAt", permissions) FROM stdin;
4657508a-a0fd-433b-87f8-9fd906b61ddf	shohrabhossain715@gmail.com	\N	shohrab hossain	\N	customer	t	\N	110198899535440855445	CTG4B71232D	t	\N	\N	f	\N	2026-01-29 13:44:07.207	2026-01-29 14:27:24.202	{seller_add_products,seller_edit_products,seller_delete_products,seller_view_orders,seller_update_orders,seller_request_payout,seller_create_coupons,seller_reply_reviews,seller_answer_questions,access_loyalty_dashboard,access_analytics,access_internal_chat,access_flash_sales,access_bulk_upload,access_export_data}
ad1eb1e3-c1ce-417c-a337-470197a9d084	admin@ctgcollection.com	$2b$10$hAf5wxSoMtG5sIdPMxjLiuVGGqGtqz4zGWfgsj1U9rZuchKV7S3IK	Admin User	+8801712345678	admin	t	\N	\N	\N	f	\N	\N	f	\N	2025-12-20 17:08:16.513	2026-02-05 02:19:09.638	{manage_shops,approve_sellers,manage_products,manage_orders,manage_users,manage_marketing,manage_content,manage_settings,manage_communications,manage_storage,manage_payouts,manage_refunds}
155e5c17-0e7d-463d-8b9b-db2019635519	sanim17@gmail.com	$2b$10$S/F5HGVtbvWbAUe1fewBDux1tLVYq4Cgimw8PtpxXZZnP94eaMh6q	Istiak Ahmed	\N	customer	t	\N	\N	26BAC574	f	\N	\N	f	\N	2026-02-05 10:21:35.899	2026-02-05 10:21:35.899	{}
6a36964a-528e-47b9-9fab-58af0c6e7419	customer@example.com	$2b$10$8tQ3G5uaFx/KjP4U3dXCnOrpsQXpFr4PXT312TRWzLVE2DJLdKIyi	John Doe	+8801812345678	customer	t	\N	\N	\N	f	\N	\N	f	\N	2025-12-20 17:08:16.891	2025-12-20 17:08:16.891	{}
c7adfa46-c7ee-4417-9c57-2eb06307677b	fahim.rahman@email.com	$2b$10$8tQ3G5uaFx/KjP4U3dXCnOrpsQXpFr4PXT312TRWzLVE2DJLdKIyi	Fahim Rahman	+8801911223344	customer	t	\N	\N	\N	f	\N	\N	f	\N	2025-12-20 17:08:35.225	2025-12-20 17:08:35.225	{}
e56c7e4b-9d90-464f-aa5e-aebeb68dd3d2	nasrin.akter@email.com	$2b$10$8tQ3G5uaFx/KjP4U3dXCnOrpsQXpFr4PXT312TRWzLVE2DJLdKIyi	Nasrin Akter	+8801722334455	customer	t	\N	\N	\N	f	\N	\N	f	\N	2025-12-20 17:08:36.003	2025-12-20 17:08:36.003	{}
3427e8b5-a9cf-4cfe-b5a1-d2152fbb6d2e	rahim.mia@email.com	$2b$10$8tQ3G5uaFx/KjP4U3dXCnOrpsQXpFr4PXT312TRWzLVE2DJLdKIyi	Rahim Mia	+8801833445566	customer	t	\N	\N	\N	f	\N	\N	f	\N	2025-12-20 17:08:36.273	2025-12-20 17:08:36.273	{}
7c428dc4-c90e-4cf7-8cce-3e2285478c58	ayesha.begum@email.com	$2b$10$8tQ3G5uaFx/KjP4U3dXCnOrpsQXpFr4PXT312TRWzLVE2DJLdKIyi	Ayesha Begum	+8801944556677	customer	t	\N	\N	\N	f	\N	\N	f	\N	2025-12-20 17:08:36.555	2025-12-20 17:08:36.555	{}
27d2ef7d-3edf-4520-8fe9-12aae61415cc	kamal.hossain@email.com	$2b$10$8tQ3G5uaFx/KjP4U3dXCnOrpsQXpFr4PXT312TRWzLVE2DJLdKIyi	Kamal Hossain	+8801655667788	customer	t	\N	\N	\N	f	\N	\N	f	\N	2025-12-20 17:08:36.814	2025-12-20 17:08:36.814	{}
591ddf6b-acf5-4e79-b069-a31a1ea7879d	sanim1728@gmail.com	$2b$10$4eWEXvkudYMDiyVUycCh0.2NyHVKC3HH0fcasHCA33lnJ8zTgGnFm	Super Admin	+8801700000000	superadmin	t	\N	106122691320990657173	\N	f	\N	\N	f	\N	2025-12-20 17:08:15.885	2025-12-20 19:51:18.604	{}
43fae45e-5412-4a09-9b7a-13d4621f9fe8	samiahmed095@gmail.com	\N	Sanim Ahmed	\N	customer	t	\N	107670076359443909094	\N	t	\N	\N	f	\N	2026-01-24 13:32:51.854	2026-01-24 13:32:51.854	{}
22e6c85f-944c-48a7-bd73-e8583810d66a	ctgcollection2@gmail.com	\N	CTG Collection	\N	seller	t	\N	118086038535561921160	\N	t	\N	\N	f	\N	2025-12-20 20:44:14.933	2026-01-29 13:39:36.383	{seller_add_products,seller_edit_products,seller_delete_products,seller_view_orders,seller_update_orders,seller_request_payout,seller_create_coupons,seller_reply_reviews,seller_answer_questions,access_loyalty_dashboard,access_analytics,access_internal_chat,access_flash_sales,access_bulk_upload,access_export_data}
\.


--
-- Data for Name: VerificationCode; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."VerificationCode" (id, code, type, "userId", email, phone, "expiresAt", used, attempts, "createdAt") FROM stdin;
af003619-34a0-49a3-8b58-c91cfbdb03c6	847458	email_verify	155e5c17-0e7d-463d-8b9b-db2019635519	sanim17@gmail.com	\N	2026-02-05 10:26:37.316	f	0	2026-02-05 10:21:37.317
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
-- Name: InternalMessage InternalMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InternalMessage"
    ADD CONSTRAINT "InternalMessage_pkey" PRIMARY KEY (id);


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
-- Name: PayoutRequest PayoutRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PayoutRequest"
    ADD CONSTRAINT "PayoutRequest_pkey" PRIMARY KEY (id);


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
-- Name: RefundRequest RefundRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RefundRequest"
    ADD CONSTRAINT "RefundRequest_pkey" PRIMARY KEY (id);


--
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- Name: SellerApplication SellerApplication_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SellerApplication"
    ADD CONSTRAINT "SellerApplication_pkey" PRIMARY KEY (id);


--
-- Name: Shop Shop_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Shop"
    ADD CONSTRAINT "Shop_pkey" PRIMARY KEY (id);


--
-- Name: SiteSetting SiteSetting_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SiteSetting"
    ADD CONSTRAINT "SiteSetting_pkey" PRIMARY KEY (id);


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
-- Name: InternalMessage_isRead_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "InternalMessage_isRead_idx" ON public."InternalMessage" USING btree ("isRead");


--
-- Name: InternalMessage_receiverId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "InternalMessage_receiverId_idx" ON public."InternalMessage" USING btree ("receiverId");


--
-- Name: InternalMessage_senderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "InternalMessage_senderId_idx" ON public."InternalMessage" USING btree ("senderId");


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
-- Name: Order_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Order_createdAt_idx" ON public."Order" USING btree ("createdAt");


--
-- Name: Order_orderNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Order_orderNumber_key" ON public."Order" USING btree ("orderNumber");


--
-- Name: Order_paymentStatus_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Order_paymentStatus_idx" ON public."Order" USING btree ("paymentStatus");


--
-- Name: Order_status_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Order_status_createdAt_idx" ON public."Order" USING btree (status, "createdAt");


--
-- Name: Order_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Order_status_idx" ON public."Order" USING btree (status);


--
-- Name: Order_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Order_userId_idx" ON public."Order" USING btree ("userId");


--
-- Name: Order_verificationCode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Order_verificationCode_idx" ON public."Order" USING btree ("verificationCode");


--
-- Name: Order_verificationCode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Order_verificationCode_key" ON public."Order" USING btree ("verificationCode");


--
-- Name: Payment_orderId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Payment_orderId_key" ON public."Payment" USING btree ("orderId");


--
-- Name: Payment_transactionId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Payment_transactionId_key" ON public."Payment" USING btree ("transactionId");


--
-- Name: PayoutRequest_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PayoutRequest_status_idx" ON public."PayoutRequest" USING btree (status);


--
-- Name: PayoutRequest_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PayoutRequest_userId_idx" ON public."PayoutRequest" USING btree ("userId");


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
-- Name: Product_basePrice_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Product_basePrice_idx" ON public."Product" USING btree ("basePrice");


--
-- Name: Product_categoryId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Product_categoryId_idx" ON public."Product" USING btree ("categoryId");


--
-- Name: Product_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Product_createdAt_idx" ON public."Product" USING btree ("createdAt");


--
-- Name: Product_isActive_isBestseller_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Product_isActive_isBestseller_idx" ON public."Product" USING btree ("isActive", "isBestseller");


--
-- Name: Product_isActive_isFeatured_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Product_isActive_isFeatured_idx" ON public."Product" USING btree ("isActive", "isFeatured");


--
-- Name: Product_sellerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Product_sellerId_idx" ON public."Product" USING btree ("sellerId");


--
-- Name: Product_shopId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Product_shopId_idx" ON public."Product" USING btree ("shopId");


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
-- Name: RefundRequest_orderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RefundRequest_orderId_idx" ON public."RefundRequest" USING btree ("orderId");


--
-- Name: RefundRequest_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RefundRequest_status_idx" ON public."RefundRequest" USING btree (status);


--
-- Name: RefundRequest_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RefundRequest_userId_idx" ON public."RefundRequest" USING btree ("userId");


--
-- Name: SellerApplication_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "SellerApplication_userId_key" ON public."SellerApplication" USING btree ("userId");


--
-- Name: Shop_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Shop_isActive_idx" ON public."Shop" USING btree ("isActive");


--
-- Name: Shop_ownerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Shop_ownerId_idx" ON public."Shop" USING btree ("ownerId");


--
-- Name: Shop_ownerId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Shop_ownerId_key" ON public."Shop" USING btree ("ownerId");


--
-- Name: Shop_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Shop_slug_idx" ON public."Shop" USING btree (slug);


--
-- Name: Shop_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Shop_slug_key" ON public."Shop" USING btree (slug);


--
-- Name: SiteSetting_key_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SiteSetting_key_idx" ON public."SiteSetting" USING btree (key);


--
-- Name: SiteSetting_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "SiteSetting_key_key" ON public."SiteSetting" USING btree (key);


--
-- Name: User_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_createdAt_idx" ON public."User" USING btree ("createdAt");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_googleId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_googleId_key" ON public."User" USING btree ("googleId");


--
-- Name: User_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_isActive_idx" ON public."User" USING btree ("isActive");


--
-- Name: User_referralCode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_referralCode_key" ON public."User" USING btree ("referralCode");


--
-- Name: User_role_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_role_idx" ON public."User" USING btree (role);


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
-- Name: InternalMessage InternalMessage_receiverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InternalMessage"
    ADD CONSTRAINT "InternalMessage_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InternalMessage InternalMessage_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InternalMessage"
    ADD CONSTRAINT "InternalMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
-- Name: PayoutRequest PayoutRequest_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PayoutRequest"
    ADD CONSTRAINT "PayoutRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
-- Name: Product Product_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Product Product_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE SET NULL;


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
-- Name: RefundRequest RefundRequest_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RefundRequest"
    ADD CONSTRAINT "RefundRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RefundRequest RefundRequest_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RefundRequest"
    ADD CONSTRAINT "RefundRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
-- Name: SellerApplication SellerApplication_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SellerApplication"
    ADD CONSTRAINT "SellerApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Shop Shop_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Shop"
    ADD CONSTRAINT "Shop_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


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

\unrestrict GTPduLanIgMe3vqUzWDPFXMJzdy90J6iJf3cwACmfDbor7avapZViGxfzXwnLse

