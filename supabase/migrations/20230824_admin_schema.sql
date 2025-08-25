-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create enum for order status
create type order_status as enum ('pending', 'processing', 'shipped', 'delivered', 'cancelled');

-- Create orders table
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete set null,
  status order_status not null default 'pending',
  total_amount numeric(10, 2) not null,
  payment_status text not null default 'pending',
  payment_method text,
  payment_id text,
  shipping_address jsonb not null,
  billing_address jsonb,
  admin_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create order_items table
create table if not exists public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete set null,
  quantity integer not null,
  price numeric(10, 2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create email_logs table
create table if not exists public.email_logs (
  id uuid default uuid_generate_v4() primary key,
  to_email text not null,
  subject text not null,
  status text not null,
  sent_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete set null,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on all tables
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.email_logs enable row level security;

-- Create RLS policies for orders
create policy "Users can view their own orders"
  on public.orders
  for select
  using (auth.uid() = user_id);

create policy "Admins can manage all orders"
  on public.orders
  for all
  using (
    exists (
      select 1 from auth.users
      where id = auth.uid() 
      and raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create RLS policies for order_items
create policy "Users can view their own order items"
  on public.order_items
  for select
  using (
    exists (
      select 1 from public.orders
      where id = order_id and user_id = auth.uid()
    )
  );

create policy "Admins can manage all order items"
  on public.order_items
  for all
  using (
    exists (
      select 1 from auth.users
      where id = auth.uid() 
      and raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create RLS policies for email_logs
create policy "Users can view their own email logs"
  on public.email_logs
  for select
  using (auth.uid() = user_id);

create policy "Admins can view all email logs"
  on public.email_logs
  for select
  using (
    exists (
      select 1 from auth.users
      where id = auth.uid() 
      and raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create or replace trigger update_orders_updated_at
before update on public.orders
for each row execute function public.update_updated_at_column();

-- Create function to handle new orders
create or replace function public.handle_new_order()
returns trigger as $$
begin
  -- Send order confirmation email
  perform
    net.http_post(
      'http://your-app-url/api/send-email',
      jsonb_build_object(
        'to', auth.users.email,
        'subject', 'Order Confirmation #' || new.id,
        'text', 'Thank you for your order! Your order has been received and is being processed.\n\n' ||
                'Order #' || new.id || '\n' ||
                'Total: $' || new.total_amount || '\n\n' ||
                'We will notify you once your order ships.',
        'html', '<h2>Thank you for your order!</h2>' ||
                '<p>Your order has been received and is being processed.</p>' ||
                '<p><strong>Order #' || new.id || '</strong></p>' ||
                '<p><strong>Total: $' || new.total_amount || '</strong></p>' ||
                '<p>We will notify you once your order ships.</p>'
      ),
      'application/json',
      '{"Authorization": "Bearer ' || current_setting('app.settings.jwt_secret') || '"}'
    )
  from auth.users
  where id = new.user_id;
  
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new orders
create or replace trigger on_new_order
after insert on public.orders
for each row execute function public.handle_new_order();

-- Create function to handle order status updates
create or replace function public.handle_order_status_update()
returns trigger as $$
begin
  if old.status is distinct from new.status then
    -- Send status update email
    perform
      net.http_post(
        'http://your-app-url/api/send-email',
        jsonb_build_object(
          'to', auth.users.email,
          'subject', 'Order #' || new.id || ' Status Update: ' || new.status,
          'text', 'Your order status has been updated.\n\n' ||
                  'Order #' || new.id || '\n' ||
                  'New Status: ' || new.status || '\n\n' ||
                  case when new.admin_notes is not null then 'Notes: ' || new.admin_notes || '\n\n' else '' end ||
                  'Thank you for shopping with us!',
          'html', '<h2>Order Status Updated</h2>' ||
                  '<p>Your order status has been updated.</p>' ||
                  '<p><strong>Order #' || new.id || '</strong></p>' ||
                  '<p><strong>New Status:</strong> ' || new.status || '</p>' ||
                  case when new.admin_notes is not null 
                       then '<div style="margin: 15px 0; padding: 10px; background: #f5f5f5; border-radius: 4px;">' ||
                            '<p><strong>Notes:</strong></p><p>' || new.admin_notes || '</p></div>' 
                       else '' end ||
                  '<p>Thank you for shopping with us!</p>'
        ),
        'application/json',
        '{"Authorization": "Bearer ' || current_setting('app.settings.jwt_secret') || '"}'
      )
    from auth.users
    where id = new.user_id;
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for order status updates
create or replace trigger on_order_status_update
after update of status on public.orders
for each row
when (old.status is distinct from new.status)
execute function public.handle_order_status_update();
