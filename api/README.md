# EventifyMTEP (Rails API)
Eventify — Multi-Tenant Event Platform


## DB 

Use DBML to define your database structure

Docs: https://dbml.dbdiagram.io/docs

Diagram: https://dbdiagram.io/d

```
Table Users {
  id integer [primary key]
  username varchar
  email varchar
  password varchar
  created_at timestamp
  is_admin bool
}


Table Events {
  id integer [primary key]
  title  varchar
  description  varchar
  brand_id int [ref: > Brands.id, not null]
  location varchar
  category_id integer
  start_date timestamp
  end_date timestamp
  status  event_status
  created_at timestamp
}

Table Categories {
    id integer [primary key]
    name varchar
}

Table Brands {
    id integer [primary key]
    name varchar
    description  varchar
}
Table Owners {
    id integer [primary key]
    user_id int [ref: > Users.id, not null]
    brand_id int [ref: > Brands.id, not null]
    
}

Table Tickets {
  id integer [primary key]
  user_id int [ref: > Users.id, not null]
  event_id int [ref: > Events.id, not null]
  rating int // (1-5)
  comment varchar
  qr_code varchar
  is_active bool
  created_at timestamp
}


Enum event_status {
    draft
    draft_on_review
    published
    rejected
    published_unverified
    published_on_review
    published_rejected
    archived
    cancelled
}


Ref: "Categories"."id" <> "Events"."category_id"
```
