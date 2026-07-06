create table if not exists users(
    id serial primary key,
    email varchar(255) unique not null,
    password_hash varchar(255) not null,
    created_at timestamp default now()
);