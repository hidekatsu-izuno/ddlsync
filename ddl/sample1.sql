create table sample1_a (
  i_value integer,
  n_value numeric,
  r_value real,
  t_value text,
  b_value blob
);

create view v_sampe1 as
select b_value as dbx from
sample1_a;

CREATE TABLE SAMPLE1_B (
  I_VALUE INTEGER NOT NULL PRIMARY KEY,
  N_VALUE NUMERIC null,
  R_VALUE REAL not null,
  T_VALUE TEXT NULL,
  B_VALUE BLOB NOT NULL
);

Create Table "Sample1_C" (
  "I_Value" Integer,
  [N_Value] Numeric not null,
  "R_Value" Real,
  `T_Value` Text Not Null,
  "B_Value" Blob,
  PRIMARY KEY("I_Value", "R_Value")
);

select 1;

create table xxx (
  item
);
insert into xxx (
  item
) values (
  'item'
)
