/*
  # Create comprehensive menu system for Themis

  1. New Tables
    - `menu_items`
      - `id` (uuid, primary key)
      - `name` (text)
      - `grams` (text, optional for items without weight)
      - `price` (numeric)
      - `category` (text)
      - `is_available` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `menu_items` table
    - Add policy for authenticated users to read menu items
    - Add policy for admins to manage menu items

  3. Initial Data
    - Populate with complete menu from requirements
*/

-- Drop existing menu_items table if it exists
DROP TABLE IF EXISTS menu_items CASCADE;

-- Create menu_items table
CREATE TABLE menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  grams text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  category text NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "All users can read menu items"
  ON menu_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage menu items"
  ON menu_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_name ON menu_items(name);

-- Insert initial menu data
INSERT INTO menu_items (name, grams, price, category) VALUES
-- ЗАВТРАКИ
('Жареные яйца', '2шт', 180, 'ЗАВТРАКИ'),
('Жареные яйца с сосисками', '2шт', 220, 'ЗАВТРАКИ'),
('Шакшука', '300гр', 300, 'ЗАВТРАКИ'),
('Омлет с сосисками', '300гр', 220, 'ЗАВТРАКИ'),
('Блинчики', '300гр', 150, 'ЗАВТРАКИ'),
('Оладушки', '300гр', 180, 'ЗАВТРАКИ'),
('Блинчики с творогом', '310гр', 200, 'ЗАВТРАКИ'),
('Каша в ассортименте', '310гр', 200, 'ЗАВТРАКИ'),
('Добавки', '3шт/50гр', 50, 'ЗАВТРАКИ'),

-- САЛАТЫ
('Салат свежий', '200гр', 250, 'САЛАТЫ'),
('Кавказская нарезка', '200гр', 350, 'САЛАТЫ'),
('Салат греческий', '250гр', 300, 'САЛАТЫ'),
('Цезарь с курицей', '250гр', 350, 'САЛАТЫ'),
('Салат китайский', '250гр', 350, 'САЛАТЫ'),

-- ПЕРВЫЕ БЛЮДА
('Борщ', '300гр', 300, 'ПЕРВЫЕ БЛЮДА'),
('Солянка', '300гр', 350, 'ПЕРВЫЕ БЛЮДА'),
('Чечевичный суп', '300гр', 300, 'ПЕРВЫЕ БЛЮДА'),
('Шорпо из говядины', '300гр', 300, 'ПЕРВЫЕ БЛЮДА'),
('Пельмени', '300гр', 300, 'ПЕРВЫЕ БЛЮДА'),
('Суп лапша из курицы', '300гр', 250, 'ПЕРВЫЕ БЛЮДА'),
('Рамен с добавками', '300гр', 400, 'ПЕРВЫЕ БЛЮДА'),

-- ВТОРЫЕ БЛЮДА
('Котлеты', '2шт', 300, 'ВТОРЫЕ БЛЮДА'),
('Наггетсы', '200гр', 300, 'ВТОРЫЕ БЛЮДА'),
('Вареники со сметаной', '200гр', 250, 'ВТОРЫЕ БЛЮДА'),
('Курица в кисло-сладком соусе', '350гр', 350, 'ВТОРЫЕ БЛЮДА'),
('Фрикасе с нежной курочкой', '350гр', 350, 'ВТОРЫЕ БЛЮДА'),

-- НАЦИОНАЛЬНАЯ КУХНЯ
('Куурдак с говядиной', '350гр', 450, 'НАЦИОНАЛЬНАЯ КУХНЯ'),
('Манты с говядиной', '5шт', 350, 'НАЦИОНАЛЬНАЯ КУХНЯ'),
('Плов на костре', '350гр', 350, 'НАЦИОНАЛЬНАЯ КУХНЯ'),
('Лагман по-домашнему', '400гр', 350, 'НАЦИОНАЛЬНАЯ КУХНЯ'),
('Лагман гуйру (отдельно)', '350гр', 380, 'НАЦИОНАЛЬНАЯ КУХНЯ'),
('Лагман босо (жареный)', '350гр', 400, 'НАЦИОНАЛЬНАЯ КУХНЯ'),
('Ганфан', '350гр', 350, 'НАЦИОНАЛЬНАЯ КУХНЯ'),

-- ГАРНИРЫ
('Гречка', '150гр', 150, 'ГАРНИРЫ'),
('Рис', '150гр', 150, 'ГАРНИРЫ'),
('Картофель фри', '150гр', 150, 'ГАРНИРЫ'),
('Сложный гарнир', '150гр', 150, 'ГАРНИРЫ'),
('Картофель по-деревенски', '150гр', 150, 'ГАРНИРЫ'),

-- БАР
('Чай чайник', NULL, 100, 'БАР'),
('Кофе свежесваренный', NULL, 180, 'БАР'),
('Coca Cola, Fanta, Sprite', '1л', 150, 'БАР'),
('Вода с газом', '1л', 100, 'БАР'),
('Вода без газа', '1л', 100, 'БАР'),
('Компот', '1л', 120, 'БАР'),

-- ШАШЛЫКИ
('Крылышки куриные', '200гр', 300, 'ШАШЛЫКИ'),
('Баранина мякоть', '180гр', 300, 'ШАШЛЫКИ'),
('Бараньи ребрышки', '180гр', 350, 'ШАШЛЫКИ'),
('Утиное филе', '180гр', 300, 'ШАШЛЫКИ'),
('Овощи на гриле', '200гр', 200, 'ШАШЛЫКИ'),
('Форель на мангале', '100гр', 400, 'ШАШЛЫКИ'),

-- БЛЮДА НА КОМПАНИЮ
('Плов на костре', '7-8 человек', 3000, 'БЛЮДА НА КОМПАНИЮ'),
('Дымляма', '7-8 человек', 3500, 'БЛЮДА НА КОМПАНИЮ'),
('Пирожок', '7-8 человек', 4000, 'БЛЮДА НА КОМПАНИЮ'),

-- ФАСТФУД
('Бургер', NULL, 400, 'ФАСТФУД'),
('Ролл с курицей', NULL, 400, 'ФАСТФУД');