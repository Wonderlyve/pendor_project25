-- Créer des utilisateurs de test pour les paris sportifs
-- Note: Ces user_id sont générés de manière déterministe pour les tests

-- Insérer les profils des utilisateurs
INSERT INTO public.profiles (user_id, username, display_name, badge) VALUES
('11111111-1111-1111-1111-111111111111', 'starwin', 'Starwin', 'Pro'),
('22222222-2222-2222-2222-222222222222', 'victoirepro', 'VictoirePro', 'Expert'),
('33333333-3333-3333-3333-333333333333', 'winwin', 'Winwin', 'Pro'),
('44444444-4444-4444-4444-444444444444', 'pronosur', 'Pronosur', 'Expert'),
('55555555-5555-5555-5555-555555555555', 'patrickprono', 'PatrickProno', 'Pro')
ON CONFLICT (user_id) DO NOTHING;

-- Créer des posts pour Starwin
INSERT INTO public.posts (user_id, content, sport, match_teams, prediction_text, analysis, odds, confidence) VALUES
('11111111-1111-1111-1111-111111111111', '🔥 Arsenal vs Tottenham - Le derby de Londres ! 
Ma prédiction: Arsenal gagnant @1.57
Les Gunners sont en forme et à domicile, ils ont les armes pour battre Tottenham.', 'Football', 'Arsenal FC vs Tottenham Hotspur FC', 'Arsenal gagnant', 'Arsenal en forme, avantage domicile décisif', 1.57, 85),

('11111111-1111-1111-1111-111111111111', '⚽ Al-Qadisiya vs Levante UD
Cote intéressante sur le X2 @2.08
Levante a plus d''expérience, je mise sur eux.', 'Football', 'Al-Qadisiya vs Levante UD', 'X2 (Nul ou Levante)', 'Levante plus expérimenté dans ce type de match', 2.08, 75),

('11111111-1111-1111-1111-111111111111', '🎯 AS Rome vs Cannes
Rome ultra-favori @1.08 mais attention au piège !
Je reste prudent sur ce match.', 'Football', 'AS Rome vs Cannes', 'AS Rome gagnant', 'Cote très faible, attention au piège typique', 1.08, 65),

('11111111-1111-1111-1111-111111111111', '💪 HJK Helsinki vs FC Arda Kardzhali
Helsinki à domicile @1.67, bon rapport risque/gain', 'Football', 'HJK Helsinki vs FC Arda Kardzhali', 'HJK Helsinki gagnant', 'Avantage domicile pour Helsinki', 1.67, 80),

('11111111-1111-1111-1111-111111111111', '🔥 Sparta Prague vs FK Aktobe
Sparta ultra-favori @1.15, mise sécurisée', 'Football', 'Sparta Prague vs FK Aktobe', 'Sparta Prague gagnant', 'Énorme différence de niveau entre les deux équipes', 1.15, 90),

('11111111-1111-1111-1111-111111111111', '⭐ NK Maribor vs Paksi SE
Match équilibré, je tente Maribor @1.78', 'Football', 'NK Maribor vs Paksi SE', 'NK Maribor gagnant', 'Légère préférence pour Maribor', 1.78, 70),

('11111111-1111-1111-1111-111111111111', '🎲 Jagiellonia Bialystok vs FK Novi Pazar
Jagiellonia favori @1.34, cote correcte', 'Football', 'Jagiellonia Bialystok vs FK Novi Pazar', 'Jagiellonia gagnant', 'Qualité supérieure de Jagiellonia', 1.34, 82),

('11111111-1111-1111-1111-111111111111', '⚡ Hajduk Split vs Zira FK
Split légèrement favori @1.46', 'Football', 'Hajduk Split vs Zira FK', 'Hajduk Split gagnant', 'Split plus régulier cette saison', 1.46, 77),

('11111111-1111-1111-1111-111111111111', '🏆 FC Utrecht vs Sheriff Tiraspol
Utrecht @1.37, bon choix sécurisé', 'Football', 'FC Utrecht vs Sheriff Tiraspol', 'FC Utrecht gagnant', 'Utrecht supérieur techniquement', 1.37, 85),

('11111111-1111-1111-1111-111111111111', '🔥 CFR Cluj vs FC Lugano
Match serré, je tente Cluj @2.30', 'Football', 'CFR Cluj vs FC Lugano', 'CFR Cluj gagnant', 'Cluj motivé à domicile', 2.30, 68);

-- Créer des posts pour VictoirePro  
INSERT INTO public.posts (user_id, content, sport, match_teams, prediction_text, analysis, odds, confidence) VALUES
('22222222-2222-2222-2222-222222222222', '🎯 ANALYSE EXPERT - Arsenal vs Tottenham
👑 Arsenal GAGNANT @1.57
Forme excellente d''Arsenal, Tottenham en difficulté', 'Football', 'Arsenal FC vs Tottenham Hotspur FC', 'Arsenal gagnant', 'Statistiques récentes favorables à Arsenal', 1.57, 88),

('22222222-2222-2222-2222-222222222222', '💎 PÉPITE du jour - Mohun Bagan vs Mohammedan SC
Mohun Bagan @1.34 - Valeur sûre !', 'Football', 'Mohun Bagan Super Giant vs Mohammedan SC', 'Mohun Bagan gagnant', 'Équipe en confiance, bon niveau', 1.34, 83),

('22222222-2222-2222-2222-222222222222', '🔥 COUP de COEUR - Spartak Trnava vs Hibernians
Spartak @1.18 - Quasi-certitude !', 'Football', 'Spartak Trnava vs Hibernians FC', 'Spartak Trnava gagnant', 'Différence de niveau flagrante', 1.18, 92),

('22222222-2222-2222-2222-222222222222', '⚡ OCCASION - Dila Gori vs FC Riga
Match équilibré, Dila Gori @2.80', 'Football', 'Dila Gori vs FC Riga', 'Dila Gori gagnant', 'Forme récente encourageante', 2.80, 72),

('22222222-2222-2222-2222-222222222222', '🏆 EXPERT PICK - AZ Alkmaar vs Ilves
AZ ultra-favori @1.11 - Sans risque', 'Football', 'AZ Alkmaar vs Ilves Tampere', 'AZ Alkmaar gagnant', 'Niveau européen contre niveau national', 1.11, 95),

('22222222-2222-2222-2222-222222222222', '🎪 VALEUR - Royal Charleroi vs Hammarby
Charleroi @2.05 - Bonne cote !', 'Football', 'Royal Charleroi vs Hammarby IF', 'Royal Charleroi gagnant', 'Expérience européenne de Charleroi', 2.05, 75),

('22222222-2222-2222-2222-222222222222', '💪 CONFIANCE - Sparta Prague vs FK Aktobe  
Sparta @1.15 - Banquier du jour', 'Football', 'Sparta Prague vs FK Aktobe', 'Sparta Prague gagnant', 'Écart de niveau considérable', 1.15, 93),

('22222222-2222-2222-2222-222222222222', '🔥 CHOIX PRO - Beitar Jerusalem vs Sutjeska
Beitar @1.18 - Mise de confiance', 'Football', 'Beitar Jerusalem FC vs FK Sutjeska Niksic', 'Beitar Jerusalem gagnant', 'Supériorité technique évidente', 1.18, 90),

('22222222-2222-2222-2222-222222222222', '⭐ SÉLECTION - Aris Salonique vs Araz Nakhchivan
Aris favori @1.38', 'Football', 'Aris Salonique vs Araz Nakhchivan PFK', 'Aris Salonique gagnant', 'Niveau grec supérieur', 1.38, 84),

('22222222-2222-2222-2222-222222222222', '🎯 FINALISTE - MSK Zilina vs Rakow
Rakow plus fort @2.18', 'Football', 'MSK Zilina vs RKS Rakow Czestochowa', 'Rakow Czestochowa gagnant', 'Expérience européenne récente de Rakow', 2.18, 76);

-- Créer des posts pour Winwin
INSERT INTO public.posts (user_id, content, sport, match_teams, prediction_text, analysis, odds, confidence) VALUES
('33333333-3333-3333-3333-333333333333', '🏆 WIN-WIN du jour !
Arsenal vs Tottenham - Arsenal @1.57
Mes stats montrent 80% de chances !', 'Football', 'Arsenal FC vs Tottenham Hotspur FC', 'Arsenal gagnant', 'Statistiques personnelles très favorables', 1.57, 80),

('33333333-3333-3333-3333-333333333333', '💰 JACKPOT ALERT !
Ekwendeni vs Big Bullets - Big Bullets @1.46
Valeur exceptionnelle !', 'Football', 'Ekwendeni Hammers FC vs Big Bullets', 'Big Bullets gagnant', 'Leader du championnat malawite', 1.46, 86),

('33333333-3333-3333-3333-333333333333', '⚡ QUICK WIN !
FC Spaeri vs Austria Vienne - Austria @1.25
Quasi-gratuit !', 'Football', 'FC Spaeri vs Austria Vienne', 'Austria Vienne gagnant', 'Niveau professionnel contre amateur', 1.25, 94),

('33333333-3333-3333-3333-333333333333', '🔥 HOT PICK !
Banga Gargzdai vs Rosenborg - Rosenborg @1.34
Norvégiens trop forts !', 'Football', 'FK Banga Gargzdai vs Rosenborg BK', 'Rosenborg gagnant', 'Expérience et qualité norvégienne', 1.34, 87),

('33333333-3333-3333-3333-333333333333', '🎯 DOUBLE WIN !
Sabah vs Petrocub - Sabah @1.48
Domicile déterminant !', 'Football', 'Sabah Masazir vs Petrocub Hincesti', 'Sabah Masazir gagnant', 'Avantage du terrain décisif', 1.48, 82),

('33333333-3333-3333-3333-333333333333', '💎 DIAMANT !
AIK Solna vs Paide - AIK @1.25
Suédois trop forts !', 'Football', 'AIK Solna vs Paide Linnameeskond', 'AIK Solna gagnant', 'Différence de championnat importante', 1.25, 91),

('33333333-3333-3333-3333-333333333333', '🚀 ROCKET BET !
Brondby vs HB Torshavn - Brondby @1.06
Danois imbattables !', 'Football', 'Brondby IF vs HB Torshavn', 'Brondby gagnant', 'Écart de niveau astronomique', 1.06, 98),

('33333333-3333-3333-3333-333333333333', '⭐ STAR CHOICE !
SK Rapid vs Decic - Rapid @1.14
Autrichiens en confiance !', 'Football', 'SK Rapid vs Decic Tuzi', 'SK Rapid gagnant', 'Qualité autrichienne évidente', 1.14, 95),

('33333333-3333-3333-3333-333333333333', '🏅 MEDAL BET !
Shamrock vs St Josephs - Shamrock @1.25
Irlandais chez eux !', 'Football', 'Shamrock Rovers vs St Josephs FC', 'Shamrock Rovers gagnant', 'Domicile + niveau supérieur', 1.25, 89),

('33333333-3333-3333-3333-333333333333', '🎪 CIRCUS WIN !
FC Lugano vs CFR Cluj - Match serré !
Je tente le nul @3.35', 'Football', 'CFR Cluj vs FC Lugano', 'Match nul', 'Deux équipes de niveau similaire', 3.35, 65);

-- Créer des posts pour Pronosur
INSERT INTO public.posts (user_id, content, sport, match_teams, prediction_text, analysis, odds, confidence) VALUES
('44444444-4444-4444-4444-444444444444', '📊 ANALYSE STATISTIQUE
Arsenal vs Tottenham | Arsenal @1.57
85% de réussite sur mes derniers pronos Arsenal', 'Football', 'Arsenal FC vs Tottenham Hotspur FC', 'Arsenal gagnant', 'Historique personnel très positif', 1.57, 85),

('44444444-4444-4444-4444-444444444444', '📈 PRONO SÉCURISÉ  
US Lecce vs UAE | Lecce @1.51
Italien à domicile, avantage certain', 'Football', 'US Lecce vs Emirats Arabes Unis', 'US Lecce gagnant', 'Club professionnel contre sélection', 1.51, 88),

('44444444-4444-4444-4444-444444444444', '🔍 ÉTUDE POUSSÉE
AS Rome vs Cannes | Rome @1.08  
Attention aux surprises ! Mise prudente', 'Football', 'AS Rome vs Cannes', 'AS Rome gagnant', 'Cote très basse = risque de surprise', 1.08, 70),

('44444444-4444-4444-4444-444444444444', '⚖️ ÉQUILIBRE PARFAIT
WKW ETO vs Pyunik | ETO @1.76
Statistiques légèrement favorables', 'Football', 'WKW ETO FC Gyor vs FC Pyunik', 'WKW ETO gagnant', 'Légère supériorité statistique', 1.76, 78),

('44444444-4444-4444-4444-444444444444', '🎲 CALCUL DE PROBABILITÉ
Milsami vs Buducnost | X @3.05
30% de chances selon mes modèles', 'Football', 'Milsami Orhei vs Buducnost Podgorica', 'Match nul', 'Modèle statistique indique équilibre', 3.05, 72),

('44444444-4444-4444-4444-444444444444', '📊 DONNÉES FIABLES
Universitatea Cluj vs Ararat | Cluj @1.58
Roumains plus réguliers cette saison', 'Football', 'Universitatea Cluj vs Ararat Armenia', 'Universitatea Cluj gagnant', 'Régularité roumaine vs instabilité arménienne', 1.58, 81),

('44444444-4444-4444-4444-444444444444', '🔬 ANALYSE TECHNIQUE
Istanbul Basaksehir vs Tcherno More | Istanbul @1.42
Turc techniquement supérieur', 'Football', 'Istanbul Basaksehir FK vs Tcherno More Varna', 'Istanbul Basaksehir gagnant', 'Supériorité technique turque', 1.42, 83),

('44444444-4444-4444-4444-444444444444', '📋 RAPPORT DÉTAILLÉ
Puskas Akademia vs Aris Limassol | Puskas @2.37
Hongrois motivés à domicile', 'Football', 'Puskas Akademia FC vs Aris Limassol', 'Puskas Akademia gagnant', 'Motivation domicile + forme récente', 2.37, 74),

('44444444-4444-4444-4444-444444444444', '🎯 PRÉCISION MAXIMALE  
Maccabi Haifa vs Torpedo Belaz | Haifa @1.63
Expérience européenne décisive', 'Football', 'Maccabi Haifa FC vs FC Torpedo Belaz Zhodino', 'Maccabi Haifa gagnant', 'Habitude des compétitions européennes', 1.63, 85),

('44444444-4444-4444-4444-444444444444', '🏆 PRONO EXPERT
Vikingur vs Vllaznia | Vikingur @1.35
Islandais en grande forme', 'Football', 'Vikingur Reykjavik vs Vllaznia Shkoder', 'Vikingur Reykjavik gagnant', 'Série positive impressionnante', 1.35, 87);

-- Créer des posts pour PatrickProno
INSERT INTO public.posts (user_id, content, sport, match_teams, prediction_text, analysis, odds, confidence) VALUES
('55555555-5555-5555-5555-555555555555', '🔥 PATRICK''S PICK OF THE DAY !
Arsenal vs Tottenham - ARSENAL WIN @1.57
Les Gunners sont chauds ! 🔴⚪', 'Football', 'Arsenal FC vs Tottenham Hotspur FC', 'Arsenal gagnant', 'Arsenal en très grande forme actuellement', 1.57, 87),

('55555555-5555-5555-5555-555555555555', '💪 PATRICK POWER BET !
Frosinone vs Casarano - Frosinone @1.31  
Italiens pros contre amateurs !', 'Football', 'Frosinone Calcio vs S.S.D. Casarano Calcio', 'Frosinone gagnant', 'Niveau série A contre niveau inférieur', 1.31, 89),

('55555555-5555-5555-5555-555555555555', '⚡ LIGHTNING PICK !
Gubbio vs Vigor Senigallia - Gubbio @1.11
Pas de surprise possible !', 'Football', 'AS Gubbio vs FC Vigor Senigallia', 'AS Gubbio gagnant', 'Écart de niveau trop important', 1.11, 96),

('55555555-5555-5555-5555-555555555555', '🎯 PATRICK''S PRECISION !
Al-Qadisiya vs Levante - Levante X2 @2.08
Espagnols plus expérimentés !', 'Football', 'Al-Qadisiya vs Levante UD', 'X2 (Nul ou Levante)', 'Expérience européenne de Levante', 2.08, 76),

('55555555-5555-5555-5555-555555555555', '🏆 CHAMPION''S CHOICE !
Hibernians vs Spartak Trnava - Spartak @1.18
Slovaques trop forts !', 'Football', 'Spartak Trnava vs Hibernians FC', 'Spartak Trnava gagnant', 'Niveau européen confirmé', 1.18, 92),

('55555555-5555-5555-5555-555555555555', '🚀 ROCKET SHOT !
Austria Vienne vs FC Spaeri - Austria @1.25
Pros contre amateurs !', 'Football', 'FC Spaeri vs Austria Vienne', 'Austria Vienne gagnant', 'Professionnels contre amateurs', 1.25, 93),

('55555555-5555-5555-5555-555555555555', '⭐ PATRICK''S STAR !
Nomme Kalju vs St Patricks - St Pat''s @1.88
Irlandais en confiance !', 'Football', 'Nomme Kalju vs St Patricks Athletic', 'St Patricks Athletic gagnant', 'Forme récente excellente des Irlandais', 1.88, 79),

('55555555-5555-5555-5555-555555555555', '🔥 HOT SHOT !
Beitar Jerusalem vs Sutjeska - Beitar @1.18
Israéliens chez eux !', 'Football', 'Beitar Jerusalem FC vs FK Sutjeska Niksic', 'Beitar Jerusalem gagnant', 'Avantage domicile + niveau supérieur', 1.18, 91),

('55555555-5555-5555-5555-555555555555', '💎 DIAMOND PICK !
FK Partizan vs Oleksandria - Partizan @2.04
Serbes motivés à domicile !', 'Football', 'FK Partizan vs FC Oleksandria', 'FK Partizan gagnant', 'Motivation domicile en Europe', 2.04, 77),

('55555555-5555-5555-5555-555555555555', '⚡ FINAL FLASH !
AEK Larnaca vs NK Celje - AEK @1.91
Chypriotes plus réguliers !', 'Football', 'AEK Larnaca vs NK Celje', 'AEK Larnaca gagnant', 'Régularité chypriote supérieure', 1.91, 81);