-- Conjuntos sem estoque próprio: o conjunto sai do estoque das duas peças que o compõem.
-- O site grava as peças de cada conjunto no item do pedido (items[].pieces); a baixa sai delas.
-- Item sem `pieces` (peça avulsa, ou pedido feito antes desta mudança) continua dando baixa nele mesmo.
create or replace function public.apply_order_stock(order_id uuid) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  item jsonb;
  piece jsonb;
begin
  update public.orders set stock_applied = true where id = order_id and not stock_applied;
  if not found then
    return;
  end if;

  for item in select jsonb_array_elements(o.items) from public.orders o where o.id = order_id loop
    if jsonb_typeof(item -> 'pieces') = 'array' then
      for piece in select jsonb_array_elements(item -> 'pieces') loop
        update public.stock
           set quantity = greatest(quantity - (item ->> 'quantity')::int, 0), updated_at = now()
         where product_id = piece ->> 'id'
           and color = piece ->> 'color'
           and size = piece ->> 'size'
           and quantity is not null;
      end loop;
    else
      update public.stock
         set quantity = greatest(quantity - (item ->> 'quantity')::int, 0), updated_at = now()
       where product_id = item ->> 'id'
         and color = item ->> 'color'
         and size = item ->> 'size'
         and quantity is not null;
    end if;
  end loop;
end;
$$;

revoke execute on function public.apply_order_stock(uuid) from public, anon, authenticated;
