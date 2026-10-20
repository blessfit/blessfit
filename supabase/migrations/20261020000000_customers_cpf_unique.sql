-- Cada CPF é de uma conta só: o cadastro e "Meus dados" barram CPF de outra conta (src/app/conta/actions.ts).
-- Antes de aplicar, confira se não há CPF repetido: select cpf, count(*) from public.customers group by cpf having count(*) > 1;
create unique index customers_cpf_key on public.customers (cpf) where cpf is not null;
