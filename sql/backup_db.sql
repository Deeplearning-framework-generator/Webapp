--
-- PostgreSQL database dump
--

\restrict wadI6zUTGe7Db3Ixbgdh1K0mTo0cDczddytZqyPgc8OmVGm3hkWAWzJwOKhIpH0

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

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
-- Name: block; Type: TABLE; Schema: public; Owner: username
--

CREATE TABLE public.block (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    registry_name character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    modality character varying(255),
    create_date timestamp without time zone,
    create_by character varying(255),
    update_date timestamp without time zone,
    update_by character varying(255),
    delete_date timestamp without time zone,
    delete_by character varying(255)
);


ALTER TABLE public.block OWNER TO username;

--
-- Name: block_id_seq; Type: SEQUENCE; Schema: public; Owner: username
--

CREATE SEQUENCE public.block_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.block_id_seq OWNER TO username;

--
-- Name: block_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: username
--

ALTER SEQUENCE public.block_id_seq OWNED BY public.block.id;


--
-- Name: block_version; Type: TABLE; Schema: public; Owner: username
--

CREATE TABLE public.block_version (
    id integer NOT NULL,
    block_id integer NOT NULL,
    version integer NOT NULL,
    code text NOT NULL,
    params jsonb,
    inputs jsonb,
    outputs jsonb,
    validated_at timestamp without time zone,
    create_date timestamp without time zone,
    create_by character varying(255)
);


ALTER TABLE public.block_version OWNER TO username;

--
-- Name: block_version_id_seq; Type: SEQUENCE; Schema: public; Owner: username
--

CREATE SEQUENCE public.block_version_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.block_version_id_seq OWNER TO username;

--
-- Name: block_version_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: username
--

ALTER SEQUENCE public.block_version_id_seq OWNED BY public.block_version.id;


--
-- Name: blocks; Type: TABLE; Schema: public; Owner: username
--

CREATE TABLE public.blocks (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    kind character varying(100) NOT NULL,
    description text NOT NULL,
    source text,
    create_date timestamp without time zone NOT NULL,
    create_by character varying(100) NOT NULL,
    update_date timestamp without time zone NOT NULL,
    update_by character varying(100) NOT NULL,
    delete_date timestamp without time zone,
    delete_by character varying(100)
);


ALTER TABLE public.blocks OWNER TO username;

--
-- Name: blocks_id_seq; Type: SEQUENCE; Schema: public; Owner: username
--

CREATE SEQUENCE public.blocks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blocks_id_seq OWNER TO username;

--
-- Name: blocks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: username
--

ALTER SEQUENCE public.blocks_id_seq OWNED BY public.blocks.id;


--
-- Name: type; Type: TABLE; Schema: public; Owner: username
--

CREATE TABLE public.type (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(255) NOT NULL,
    create_date timestamp without time zone,
    create_by character varying(255),
    update_date timestamp without time zone,
    update_by character varying(255),
    delete_date timestamp without time zone,
    delete_by character varying(255)
);


ALTER TABLE public.type OWNER TO username;

--
-- Name: type_id_seq; Type: SEQUENCE; Schema: public; Owner: username
--

CREATE SEQUENCE public.type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.type_id_seq OWNER TO username;

--
-- Name: type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: username
--

ALTER SEQUENCE public.type_id_seq OWNED BY public.type.id;


--
-- Name: block id; Type: DEFAULT; Schema: public; Owner: username
--

ALTER TABLE ONLY public.block ALTER COLUMN id SET DEFAULT nextval('public.block_id_seq'::regclass);


--
-- Name: block_version id; Type: DEFAULT; Schema: public; Owner: username
--

ALTER TABLE ONLY public.block_version ALTER COLUMN id SET DEFAULT nextval('public.block_version_id_seq'::regclass);


--
-- Name: blocks id; Type: DEFAULT; Schema: public; Owner: username
--

ALTER TABLE ONLY public.blocks ALTER COLUMN id SET DEFAULT nextval('public.blocks_id_seq'::regclass);


--
-- Name: type id; Type: DEFAULT; Schema: public; Owner: username
--

ALTER TABLE ONLY public.type ALTER COLUMN id SET DEFAULT nextval('public.type_id_seq'::regclass);


--
-- Data for Name: block; Type: TABLE DATA; Schema: public; Owner: username
--

COPY public.block (id, name, registry_name, type, modality, create_date, create_by, update_date, update_by, delete_date, delete_by) FROM stdin;
\.


--
-- Data for Name: block_version; Type: TABLE DATA; Schema: public; Owner: username
--

COPY public.block_version (id, block_id, version, code, params, inputs, outputs, validated_at, create_date, create_by) FROM stdin;
\.


--
-- Data for Name: blocks; Type: TABLE DATA; Schema: public; Owner: username
--

COPY public.blocks (id, name, kind, description, source, create_date, create_by, update_date, update_by, delete_date, delete_by) FROM stdin;
\.


--
-- Data for Name: type; Type: TABLE DATA; Schema: public; Owner: username
--

COPY public.type (id, name, code, create_date, create_by, update_date, update_by, delete_date, delete_by) FROM stdin;
2	module	MODULE_CODE	2026-10-09 10:19:06.939743	\N	\N	\N	\N	\N
3	dataset	DATASET_CODE	2026-10-09 10:19:06.939743	\N	\N	\N	\N	\N
\.


--
-- Name: block_id_seq; Type: SEQUENCE SET; Schema: public; Owner: username
--

SELECT pg_catalog.setval('public.block_id_seq', 1, false);


--
-- Name: block_version_id_seq; Type: SEQUENCE SET; Schema: public; Owner: username
--

SELECT pg_catalog.setval('public.block_version_id_seq', 1, false);


--
-- Name: blocks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: username
--

SELECT pg_catalog.setval('public.blocks_id_seq', 1, false);


--
-- Name: type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: username
--

SELECT pg_catalog.setval('public.type_id_seq', 3, true);


--
-- Name: block block_pkey; Type: CONSTRAINT; Schema: public; Owner: username
--

ALTER TABLE ONLY public.block
    ADD CONSTRAINT block_pkey PRIMARY KEY (id);


--
-- Name: block_version block_version_block_id_version_key; Type: CONSTRAINT; Schema: public; Owner: username
--

ALTER TABLE ONLY public.block_version
    ADD CONSTRAINT block_version_block_id_version_key UNIQUE (block_id, version);


--
-- Name: block_version block_version_pkey; Type: CONSTRAINT; Schema: public; Owner: username
--

ALTER TABLE ONLY public.block_version
    ADD CONSTRAINT block_version_pkey PRIMARY KEY (id);


--
-- Name: blocks blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: username
--

ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT blocks_pkey PRIMARY KEY (id);


--
-- Name: type type_name_key; Type: CONSTRAINT; Schema: public; Owner: username
--

ALTER TABLE ONLY public.type
    ADD CONSTRAINT type_name_key UNIQUE (name);


--
-- Name: type type_pkey; Type: CONSTRAINT; Schema: public; Owner: username
--

ALTER TABLE ONLY public.type
    ADD CONSTRAINT type_pkey PRIMARY KEY (id);


--
-- Name: block_version block_version_block_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: username
--

ALTER TABLE ONLY public.block_version
    ADD CONSTRAINT block_version_block_id_fkey FOREIGN KEY (block_id) REFERENCES public.block(id);


--
-- PostgreSQL database dump complete
--

\unrestrict wadI6zUTGe7Db3Ixbgdh1K0mTo0cDczddytZqyPgc8OmVGm3hkWAWzJwOKhIpH0

