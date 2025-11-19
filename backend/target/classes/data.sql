-- Three Rivers Bank Business Credit Cards Seed Data

-- 1. Business Cash Rewards Card
INSERT INTO credit_card (id, name, card_type, annual_fee, intro_apr, regular_apr, rewards_rate, signup_bonus, credit_score_needed, foreign_transaction_fee, description, features, benefits) 
VALUES (1, 'Business Cash Rewards', 'Cash Back', 0.00, '0% for 12 months', '18.99% - 26.99%', 2.00, '$300 statement credit after $3,000 in purchases within first 3 months', 'Good to Excellent (670+)', 0.00, 
'Earn unlimited 2% cash back on every purchase with no rotating categories or caps. Perfect for businesses that want simplicity and consistent rewards.', 
'Unlimited 2% cash back on all purchases;No annual fee;0% intro APR for 12 months;Free employee cards;Real-time purchase alerts;Fraud protection guarantee', 
'Cashback deposited monthly;No foreign transaction fees;Travel accident insurance;Purchase protection up to $10,000;Extended warranty coverage;24/7 customer service');

-- 2. Business Travel Rewards Card
INSERT INTO credit_card (id, name, card_type, annual_fee, intro_apr, regular_apr, rewards_rate, signup_bonus, credit_score_needed, foreign_transaction_fee, description, features, benefits) 
VALUES (2, 'Business Travel Rewards', 'Travel Rewards', 95.00, 'N/A', '19.99% - 27.99%', 3.00, '50,000 bonus points after $4,000 in purchases within first 3 months', 'Excellent (720+)', 0.00, 
'Maximize your travel rewards with 3X points on travel and dining. Ideal for businesses with frequent travel needs.', 
'3X points on travel and dining;1X points on all other purchases;$95 annual fee;Annual travel credit of $100;Priority boarding benefits;No foreign transaction fees', 
'Complimentary airport lounge access;Travel insurance up to $1M;Lost luggage reimbursement;Trip cancellation protection;Car rental insurance;Global concierge service');

-- 3. Business Platinum Card
INSERT INTO credit_card (id, name, card_type, annual_fee, intro_apr, regular_apr, rewards_rate, signup_bonus, credit_score_needed, foreign_transaction_fee, description, features, benefits) 
VALUES (3, 'Business Platinum', 'Low Interest', 0.00, '0% for 15 months', '20.99% - 28.99%', 0.00, 'No signup bonus', 'Good (670+)', 0.00, 
'Extended 0% intro APR for 15 months makes this card perfect for businesses planning large purchases or needing to finance operations.', 
'0% intro APR for 15 months;No annual fee;No foreign transaction fees;Free employee cards with spending limits;Detailed expense reporting;Integration with accounting software', 
'No penalty APR;Grace period for purchases;Account alerts and notifications;Fraud liability protection;Purchase protection;Emergency card replacement');

-- 4. Business Premium Card
INSERT INTO credit_card (id, name, card_type, annual_fee, intro_apr, regular_apr, rewards_rate, signup_bonus, credit_score_needed, foreign_transaction_fee, description, features, benefits) 
VALUES (4, 'Business Premium', 'Premium Rewards', 150.00, 'N/A', '17.99% - 25.99%', 1.50, '$500 statement credit after $5,000 in purchases within first 3 months', 'Excellent (740+)', 0.00, 
'Premium benefits and rewards for established businesses. Earn unlimited 1.5% cash back on all purchases with enhanced travel and purchase protections.', 
'Unlimited 1.5% cash back;$150 annual fee waived first year;Cell phone protection;Roadside assistance;Premium travel insurance;Dedicated account manager', 
'Trip delay reimbursement;Baggage insurance;Emergency medical and dental;Extended warranty protection;Return protection;Price protection;Premium concierge service');

-- 5. Business Flex Card
INSERT INTO credit_card (id, name, card_type, annual_fee, intro_apr, regular_apr, rewards_rate, signup_bonus, credit_score_needed, foreign_transaction_fee, description, features, benefits) 
VALUES (5, 'Business Flex', 'Flexible Rewards', 0.00, 'N/A', '21.99% - 29.99%', 3.00, '$200 statement credit after $2,000 in purchases within first 3 months', 'Fair to Good (640+)', 3.00, 
'Flexible tiered rewards that adapt to your business spending. Earn 3% on your top spending category, 2% on your second, and 1% on all other purchases automatically.', 
'Tiered rewards: 3% on top category, 2% on second, 1% on rest;No annual fee;Automatic category optimization;Mobile app with expense tracking;Receipt capture technology;QuickBooks integration', 
'Quarterly rewards summary;Expense categorization;Employee spending controls;Fraud monitoring;Paperless statements;Mobile deposit;Online account management');

-- Card Features for Business Cash Rewards
INSERT INTO card_feature (card_id, feature_name, feature_value, feature_type) VALUES 
(1, 'Rewards Type', 'Cash Back', 'rewards'),
(1, 'Cash Back Rate', '2% on all purchases', 'rewards'),
(1, 'Annual Fee', '$0', 'fee'),
(1, 'Intro APR Period', '12 months', 'apr'),
(1, 'Employee Cards', 'Free unlimited', 'benefit'),
(1, 'Expense Management', 'Real-time tracking', 'feature');

-- Card Features for Business Travel Rewards
INSERT INTO card_feature (card_id, feature_name, feature_value, feature_type) VALUES 
(2, 'Rewards Type', 'Travel Points', 'rewards'),
(2, 'Travel Rewards', '3X points', 'rewards'),
(2, 'Dining Rewards', '3X points', 'rewards'),
(2, 'Annual Travel Credit', '$100', 'benefit'),
(2, 'Lounge Access', 'Complimentary', 'benefit'),
(2, 'Travel Insurance', 'Up to $1M', 'benefit');

-- Card Features for Business Platinum
INSERT INTO card_feature (card_id, feature_name, feature_value, feature_type) VALUES 
(3, 'Rewards Type', 'None', 'rewards'),
(3, 'Intro APR', '0% for 15 months', 'apr'),
(3, 'Annual Fee', '$0', 'fee'),
(3, 'Foreign Transaction Fee', '0%', 'fee'),
(3, 'Employee Card Controls', 'Yes', 'feature'),
(3, 'Accounting Integration', 'QuickBooks, Xero', 'feature');

-- Card Features for Business Premium
INSERT INTO card_feature (card_id, feature_name, feature_value, feature_type) VALUES 
(4, 'Rewards Type', 'Cash Back', 'rewards'),
(4, 'Cash Back Rate', '1.5% unlimited', 'rewards'),
(4, 'Annual Fee', '$150 (waived 1st year)', 'fee'),
(4, 'Cell Phone Protection', 'Up to $800', 'benefit'),
(4, 'Roadside Assistance', '24/7', 'benefit'),
(4, 'Account Manager', 'Dedicated', 'feature');

-- Card Features for Business Flex
INSERT INTO card_feature (card_id, feature_name, feature_value, feature_type) VALUES 
(5, 'Rewards Type', 'Tiered Cash Back', 'rewards'),
(5, 'Top Category Rewards', '3%', 'rewards'),
(5, 'Second Category Rewards', '2%', 'rewards'),
(5, 'Other Purchases', '1%', 'rewards'),
(5, 'Receipt Capture', 'Mobile app', 'feature'),
(5, 'QuickBooks Integration', 'Yes', 'feature');

-- Fee Schedules
INSERT INTO fee_schedule (card_id, fee_type, fee_amount, fee_description) VALUES 
(1, 'Annual Fee', 0.00, 'No annual fee'),
(1, 'Late Payment', 40.00, 'Late payment fee up to $40'),
(1, 'Cash Advance', 5.00, 'Greater of $5 or 3% of cash advance amount'),
(1, 'Foreign Transaction', 0.00, 'No foreign transaction fees'),
(1, 'Balance Transfer', 0.00, 'No balance transfer fee for first 60 days, then 3%');

INSERT INTO fee_schedule (card_id, fee_type, fee_amount, fee_description) VALUES 
(2, 'Annual Fee', 95.00, '$95 annual fee'),
(2, 'Late Payment', 40.00, 'Late payment fee up to $40'),
(2, 'Cash Advance', 5.00, 'Greater of $5 or 3% of cash advance amount'),
(2, 'Foreign Transaction', 0.00, 'No foreign transaction fees'),
(2, 'Balance Transfer', 0.00, 'No balance transfer fee for first 60 days, then 3%');

INSERT INTO fee_schedule (card_id, fee_type, fee_amount, fee_description) VALUES 
(3, 'Annual Fee', 0.00, 'No annual fee'),
(3, 'Late Payment', 40.00, 'Late payment fee up to $40'),
(3, 'Cash Advance', 5.00, 'Greater of $5 or 3% of cash advance amount'),
(3, 'Foreign Transaction', 0.00, 'No foreign transaction fees'),
(3, 'Balance Transfer', 0.00, 'No balance transfer fee for first 60 days, then 3%');

INSERT INTO fee_schedule (card_id, fee_type, fee_amount, fee_description) VALUES 
(4, 'Annual Fee', 150.00, '$150 annual fee (waived first year)'),
(4, 'Late Payment', 40.00, 'Late payment fee up to $40'),
(4, 'Cash Advance', 5.00, 'Greater of $5 or 3% of cash advance amount'),
(4, 'Foreign Transaction', 0.00, 'No foreign transaction fees'),
(4, 'Balance Transfer', 0.00, 'No balance transfer fee for first 60 days, then 3%');

INSERT INTO fee_schedule (card_id, fee_type, fee_amount, fee_description) VALUES 
(5, 'Annual Fee', 0.00, 'No annual fee'),
(5, 'Late Payment', 40.00, 'Late payment fee up to $40'),
(5, 'Cash Advance', 5.00, 'Greater of $5 or 3% of cash advance amount'),
(5, 'Foreign Transaction', 3.00, '3% foreign transaction fee'),
(5, 'Balance Transfer', 0.00, 'No balance transfer fee for first 60 days, then 3%');

-- Interest Rates
INSERT INTO interest_rate (card_id, rate_type, rate_value, effective_date, calculation_method) VALUES 
(1, 'Purchase APR (Intro)', 0.00, '2024-01-01', 'Daily Balance'),
(1, 'Purchase APR (Regular)', 18.99, '2024-01-01', 'Daily Balance'),
(1, 'Cash Advance APR', 29.99, '2024-01-01', 'Daily Balance'),
(1, 'Balance Transfer APR', 18.99, '2024-01-01', 'Daily Balance');

INSERT INTO interest_rate (card_id, rate_type, rate_value, effective_date, calculation_method) VALUES 
(2, 'Purchase APR', 19.99, '2024-01-01', 'Daily Balance'),
(2, 'Cash Advance APR', 29.99, '2024-01-01', 'Daily Balance'),
(2, 'Balance Transfer APR', 19.99, '2024-01-01', 'Daily Balance');

INSERT INTO interest_rate (card_id, rate_type, rate_value, effective_date, calculation_method) VALUES 
(3, 'Purchase APR (Intro)', 0.00, '2024-01-01', 'Daily Balance'),
(3, 'Purchase APR (Regular)', 20.99, '2024-01-01', 'Daily Balance'),
(3, 'Cash Advance APR', 29.99, '2024-01-01', 'Daily Balance'),
(3, 'Balance Transfer APR (Intro)', 0.00, '2024-01-01', 'Daily Balance');

INSERT INTO interest_rate (card_id, rate_type, rate_value, effective_date, calculation_method) VALUES 
(4, 'Purchase APR', 17.99, '2024-01-01', 'Daily Balance'),
(4, 'Cash Advance APR', 29.99, '2024-01-01', 'Daily Balance'),
(4, 'Balance Transfer APR', 17.99, '2024-01-01', 'Daily Balance');

INSERT INTO interest_rate (card_id, rate_type, rate_value, effective_date, calculation_method) VALUES 
(5, 'Purchase APR', 21.99, '2024-01-01', 'Daily Balance'),
(5, 'Cash Advance APR', 29.99, '2024-01-01', 'Daily Balance'),
(5, 'Balance Transfer APR', 21.99, '2024-01-01', 'Daily Balance');
