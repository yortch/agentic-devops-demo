-- Insert Business Cash Rewards Card
INSERT INTO credit_cards (id, name, card_type, annual_fee, intro_apr, regular_apr, rewards_rate, signup_bonus, credit_score_needed, foreign_transaction_fee, description, features, benefits) 
VALUES (1, 'Business Cash Rewards', 'Cash Back', 0.00, '0% for 12 months', '18.99%-26.99%', '2% cashback on all purchases', '$300 after $3,000 spend in 3 months', 'Good to Excellent (670+)', 0.00, 
'Earn unlimited 2% cash back on every purchase with no category restrictions. Perfect for businesses that want simple, straightforward rewards.',
'Unlimited 2% cash back, No annual fee, 0% intro APR for 12 months, Employee cards at no cost',
'Cash back rewards, Expense management tools, QuickBooks integration, Purchase protection');

INSERT INTO credit_cards (id, name, card_type, annual_fee, intro_apr, regular_apr, rewards_rate, signup_bonus, credit_score_needed, foreign_transaction_fee, description, features, benefits) 
VALUES (2, 'Business Travel Rewards', 'Travel', 95.00, 'N/A', '19.99%-27.99%', '3X points on travel and dining', '50,000 points after $5,000 spend in 3 months', 'Excellent (740+)', 0.00,
'Maximize rewards on business travel and dining with 3X points. Includes travel insurance and airport lounge access.',
'3X points on travel and dining, 1X on other purchases, No foreign transaction fees, Airport lounge access',
'Travel insurance, Trip cancellation protection, Rental car insurance, Priority boarding, Concierge service');

INSERT INTO credit_cards (id, name, card_type, annual_fee, intro_apr, regular_apr, rewards_rate, signup_bonus, credit_score_needed, foreign_transaction_fee, description, features, benefits) 
VALUES (3, 'Business Platinum', 'Balance Transfer', 0.00, '0% intro APR for 15 months', '20.99%-28.99%', 'N/A', 'No signup bonus', 'Good (670+)', 0.00,
'Get 15 months of 0% intro APR to manage cash flow and finance large purchases. No annual fee makes this ideal for growing businesses.',
'0% intro APR for 15 months, No annual fee, No foreign transaction fees, Employee cards included',
'Extended payment terms, Cash flow management, Purchase protection, Emergency card replacement');

INSERT INTO credit_cards (id, name, card_type, annual_fee, intro_apr, regular_apr, rewards_rate, signup_bonus, credit_score_needed, foreign_transaction_fee, description, features, benefits) 
VALUES (4, 'Business Premium', 'Premium Rewards', 150.00, 'N/A', '17.99%-25.99%', '1.5% unlimited cashback', '$500 after $10,000 spend in 3 months', 'Excellent (740+)', 0.00,
'Premium card with enhanced benefits including travel insurance, purchase protection, and 1.5% unlimited cashback on all purchases.',
'Unlimited 1.5% cashback, Travel insurance, Purchase protection, Cell phone protection, Roadside assistance',
'$500 signup bonus, Travel insurance, Purchase protection up to $10,000, Extended warranty, Cell phone protection');

INSERT INTO credit_cards (id, name, card_type, annual_fee, intro_apr, regular_apr, rewards_rate, signup_bonus, credit_score_needed, foreign_transaction_fee, description, features, benefits) 
VALUES (5, 'Business Flex', 'Tiered Rewards', 0.00, 'N/A', '21.99%-29.99%', 'Tiered 3%-1% rewards', '$200 after $2,000 spend in 3 months', 'Fair to Good (630+)', 3.00,
'Flexible rewards with 3% on select categories, 2% on the next tier, and 1% on everything else. Choose your bonus categories quarterly.',
'Tiered rewards up to 3%, No annual fee, Flexible category selection, Expense tracking tools',
'Quarterly bonus categories, Expense management dashboard, Receipt capture app, Integration with accounting software');

-- Card Features for Business Cash Rewards (id=1)
INSERT INTO card_features (card_id, feature_name, feature_value, feature_type) VALUES 
(1, 'Cash Back Rate', '2%', 'Rewards'),
(1, 'Annual Fee', '$0', 'Fees'),
(1, 'Intro APR Period', '12 months', 'APR'),
(1, 'Employee Cards', 'Unlimited at no cost', 'Additional');

-- Card Features for Business Travel Rewards (id=2)
INSERT INTO card_features (card_id, feature_name, feature_value, feature_type) VALUES 
(2, 'Travel Rewards', '3X points', 'Rewards'),
(2, 'Dining Rewards', '3X points', 'Rewards'),
(2, 'Annual Fee', '$95', 'Fees'),
(2, 'Airport Lounge', 'Priority Pass Select', 'Travel');

-- Card Features for Business Platinum (id=3)
INSERT INTO card_features (card_id, feature_name, feature_value, feature_type) VALUES 
(3, 'Intro APR', '0% for 15 months', 'APR'),
(3, 'Annual Fee', '$0', 'Fees'),
(3, 'Balance Transfer', '0% for 15 months', 'APR'),
(3, 'Foreign Transaction Fee', '0%', 'Fees');

-- Card Features for Business Premium (id=4)
INSERT INTO card_features (card_id, feature_name, feature_value, feature_type) VALUES 
(4, 'Cash Back Rate', '1.5%', 'Rewards'),
(4, 'Annual Fee', '$150', 'Fees'),
(4, 'Travel Insurance', 'Included', 'Insurance'),
(4, 'Purchase Protection', 'Up to $10,000', 'Insurance');

-- Card Features for Business Flex (id=5)
INSERT INTO card_features (card_id, feature_name, feature_value, feature_type) VALUES 
(5, 'Top Tier Rewards', '3%', 'Rewards'),
(5, 'Mid Tier Rewards', '2%', 'Rewards'),
(5, 'Base Rewards', '1%', 'Rewards'),
(5, 'Annual Fee', '$0', 'Fees');

-- Fee Schedules
INSERT INTO fee_schedules (card_id, fee_type, fee_amount, fee_description) VALUES 
(1, 'Late Payment', 40.00, 'Charged when payment is not received by due date'),
(1, 'Returned Payment', 40.00, 'Charged when payment is returned'),
(1, 'Cash Advance', 10.00, 'Greater of $10 or 5% of advance amount'),
(2, 'Late Payment', 40.00, 'Charged when payment is not received by due date'),
(2, 'Returned Payment', 40.00, 'Charged when payment is returned'),
(2, 'Cash Advance', 10.00, 'Greater of $10 or 5% of advance amount'),
(3, 'Late Payment', 40.00, 'Charged when payment is not received by due date'),
(3, 'Returned Payment', 40.00, 'Charged when payment is returned'),
(4, 'Late Payment', 40.00, 'Charged when payment is not received by due date'),
(4, 'Returned Payment', 40.00, 'Charged when payment is returned'),
(4, 'Cash Advance', 10.00, 'Greater of $10 or 5% of advance amount'),
(5, 'Late Payment', 40.00, 'Charged when payment is not received by due date'),
(5, 'Returned Payment', 40.00, 'Charged when payment is returned'),
(5, 'Cash Advance', 10.00, 'Greater of $10 or 5% of advance amount'),
(5, 'Foreign Transaction', 3.00, '3% of transaction amount in foreign currency');

-- Interest Rates
INSERT INTO interest_rates (card_id, rate_type, rate_value, effective_date, calculation_method) VALUES 
(1, 'Purchase APR', 18.99, CURRENT_DATE, 'Daily Balance'),
(1, 'Cash Advance APR', 26.99, CURRENT_DATE, 'Daily Balance'),
(2, 'Purchase APR', 19.99, CURRENT_DATE, 'Daily Balance'),
(2, 'Cash Advance APR', 27.99, CURRENT_DATE, 'Daily Balance'),
(3, 'Purchase APR', 20.99, CURRENT_DATE, 'Daily Balance'),
(3, 'Intro APR', 0.00, CURRENT_DATE, 'Daily Balance'),
(4, 'Purchase APR', 17.99, CURRENT_DATE, 'Daily Balance'),
(4, 'Cash Advance APR', 25.99, CURRENT_DATE, 'Daily Balance'),
(5, 'Purchase APR', 21.99, CURRENT_DATE, 'Daily Balance'),
(5, 'Cash Advance APR', 29.99, CURRENT_DATE, 'Daily Balance');
