create table if not exists tasks(
id serial primary key,
user_id integer not null references users(id) on delete cascade,
title varchar(100) not null,
category text,
is_done boolean default false,
created_date date default current_date
);