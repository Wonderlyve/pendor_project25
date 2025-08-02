-- Vérifier si Pronosur existe, sinon le créer
DO $$
DECLARE
    pronosur_exists BOOLEAN;
    starwin_id UUID := 'a16d6472-76b1-4ea9-8f9d-dbe5b5ccb41e';
    victoire_id UUID := '8f2d6eb7-f908-43ae-839e-19c1275caa1c';
    winwin_id UUID := '8c3c3412-3a8e-40a9-aa6f-8284687ec36b';
    patrick_id UUID := 'f422d028-08c7-49cf-b4ad-02ed5b4bb0b6';
    pronosur_id UUID;
BEGIN
    -- Vérifier si Pronosur existe
    SELECT EXISTS(SELECT 1 FROM profiles WHERE username = 'Pronosur') INTO pronosur_exists;
    
    IF NOT pronosur_exists THEN
        -- Créer Pronosur avec un UUID généré
        pronosur_id := gen_random_uuid();
        INSERT INTO auth.users (id, email, encrypted_password, created_at, updated_at, email_confirmed_at, raw_user_meta_data)
        VALUES (
            pronosur_id,
            'pronosur@test.com',
            '$2a$10$encrypted_password_hash',
            now(),
            now(),
            now(),
            '{"username": "Pronosur", "display_name": "Pronosur"}'::jsonb
        );
        
        INSERT INTO profiles (user_id, username, display_name, phone, created_at, updated_at)
        VALUES (pronosur_id, 'Pronosur', 'Pronosur', '0981057049', now(), now());
    ELSE
        SELECT user_id INTO pronosur_id FROM profiles WHERE username = 'Pronosur';
    END IF;

    -- Créer 10 posts pour Starwin
    INSERT INTO posts (user_id, content, sport, match_teams, prediction_text, analysis, confidence, odds, created_at) VALUES
    (starwin_id, 'Arsenal vs Tottenham - Derby londonien explosif ! 🔥', 'Football', 'Arsenal FC vs Tottenham Hotspur FC', '1 (Arsenal victoire)', 'Arsenal en grande forme à domicile, Tottenham fragile en déplacement. Les Gunners ont l''avantage psychologique dans ce derby.', 85, 1.57, now() - interval '2 hours'),
    (starwin_id, 'Frosinone affrontera Casarano - Match très déséquilibré ⚽', 'Football', 'Frosinone Calcio vs S.S.D. Casarano Calcio', '1 (Frosinone victoire)', 'Frosinone évolue à un niveau supérieur. La différence de classe devrait se faire sentir rapidement.', 90, 1.31, now() - interval '1 hour 45 minutes'),
    (starwin_id, 'Lecce vs UAE - Les italiens favoris 🇮🇹', 'Football', 'US Lecce vs Emirats Arabes Unis', '1 (Lecce victoire)', 'Match amical mais Lecce reste sur son terrain avec ses automatismes. Les EAU en préparation.', 75, 1.51, now() - interval '1 hour 30 minutes'),
    (starwin_id, 'AS Rome vs Cannes - La Roma va écraser ! 💪', 'Football', 'AS Rome vs Cannes', '1 (AS Rome victoire)', 'Différence de niveau énorme entre une équipe de Serie A et une formation française de division inférieure.', 95, 1.08, now() - interval '1 hour 15 minutes'),
    (starwin_id, 'Big Bullets favori au Malawi 🇲🇼', 'Football', 'Ekwendeni Hammers FC vs Big Bullets', '2 (Big Bullets victoire)', 'Big Bullets est l''équipe dominante du championnat malawien. Victoire attendue en déplacement.', 80, 1.46, now() - interval '1 hour'),
    (starwin_id, 'Mohun Bagan en confiance en Inde 🇮🇳', 'Football', 'Mohun Bagan Super Giant vs Mohammedan SC', '1 (Mohun Bagan victoire)', 'Mohun Bagan possède un effectif plus expérimenté et joue à domicile. Avantage net.', 82, 1.34, now() - interval '45 minutes'),
    (starwin_id, 'Spartak Trnava sans problème 🔒', 'Football', 'Spartak Trnava vs Hibernians FC', '1 (Spartak victoire)', 'Spartak évolue dans un championnat plus relevé. La qualification semble acquise dès l''aller.', 88, 1.18, now() - interval '30 minutes'),
    (starwin_id, 'Austria Vienne écrasera Spaeri ⚡', 'Football', 'FC Spaeri vs Austria Vienne', '2 (Austria Vienne victoire)', 'Austria Vienne, club historique autrichien face à une équipe estonienne. Pas de surprise attendue.', 92, 1.25, now() - interval '15 minutes'),
    (starwin_id, 'Rosenborg trop fort pour Banga 🇳🇴', 'Football', 'FK Banga Gargzdai vs Rosenborg BK', '2 (Rosenborg victoire)', 'Rosenborg reste sur une excellente saison en Norvège. L''expérience européenne fera la différence.', 85, 1.34, now() - interval '10 minutes'),
    (starwin_id, 'AZ Alkmaar va dominer Ilves 🇳🇱', 'Football', 'AZ Alkmaar vs Ilves Tampere', '1 (AZ victoire)', 'AZ Alkmaar, habitué des compétitions européennes, face à une équipe finlandaise moins expérimentée.', 90, 1.11, now() - interval '5 minutes');

    -- Créer 10 posts pour VictoirePro  
    INSERT INTO posts (user_id, content, sport, match_teams, prediction_text, analysis, confidence, odds, created_at) VALUES
    (victoire_id, 'ANALYSE PREMIUM: Arsenal - Tottenham 🎯', 'Football', 'Arsenal FC vs Tottenham Hotspur FC', '1 + Plus de 2.5 buts', 'Derby intense attendu ! Arsenal solide à domicile mais Tottenham capable de surprendre. Match spectaculaire en vue.', 78, 1.57, now() - interval '2 hours 5 minutes'),
    (victoire_id, 'COUP SÛR: AS Rome vs Cannes 💎', 'Football', 'AS Rome vs Cannes', '1 + Moins de 3.5 buts', 'La Roma va gérer tranquillement cette rencontre. Victoire sans forcer contre Cannes.', 93, 1.08, now() - interval '1 hour 50 minutes'),
    (victoire_id, 'VALUE BET: Al-Qadisiya vs Levante 💰', 'Football', 'Al-Qadisiya vs Levante UD', '2 (Levante victoire)', 'Levante plus expérimenté et organisé. Cote intéressante pour les Espagnols en déplacement.', 72, 2.08, now() - interval '1 hour 35 minutes'),
    (victoire_id, 'PRONO EXPERT: Big Bullets au Malawi 🏆', 'Football', 'Ekwendeni Hammers FC vs Big Bullets', '2 + Plus de 1.5 buts', 'Big Bullets, équipe de référence du pays. Devrait s''imposer avec quelques buts d''écart.', 84, 1.46, now() - interval '1 hour 20 minutes'),
    (victoire_id, 'CONFIANCE TOTALE: Spartak Trnava 🔥', 'Football', 'Spartak Trnava vs Hibernians FC', '1 + Handicap -1', 'Différence de niveau trop importante. Spartak peut gagner large dès le match aller.', 86, 1.18, now() - interval '1 hour 5 minutes'),
    (victoire_id, 'OPPORTUNITÉ: Austria Vienne 📈', 'Football', 'FC Spaeri vs Austria Vienne', '2 + Plus de 2.5 buts', 'Austria Vienne devrait s''imposer facilement et marquer plusieurs buts face à Spaeri.', 89, 1.25, now() - interval '50 minutes'),
    (victoire_id, 'ANALYSE PRO: Rosenborg en Lituanie 🎪', 'Football', 'FK Banga Gargzdai vs Rosenborg BK', '2 + Les deux équipes marquent NON', 'Rosenborg solide défensivement. Devrait gagner sans encaisser face à Banga.', 81, 1.34, now() - interval '35 minutes'),
    (victoire_id, 'PRONO VIP: HJK Helsinki 🇫🇮', 'Football', 'HJK Helsinki vs FC Arda Kardzhali', '1 (HJK victoire)', 'HJK dominant en Finlande et habitué à l''Europe. Arda Kardzhali en apprentissage.', 79, 1.67, now() - interval '20 minutes'),
    (victoire_id, 'COUP DE MAÎTRE: AZ Alkmaar 🎭', 'Football', 'AZ Alkmaar vs Ilves Tampere', '1 + Plus de 3.5 buts', 'AZ possède un potentiel offensif énorme. Peut scorer beaucoup face à Ilves.', 87, 1.11, now() - interval '12 minutes'),
    (victoire_id, 'DERNIÈRE ANALYSE: Brondby vs HB 🔎', 'Football', 'Brondby IF vs HB Torshavn', '1 + Handicap -2', 'Brondby face aux Îles Féroé. Victoire large attendue pour les Danois à domicile.', 91, 1.06, now() - interval '3 minutes');

    -- Créer 10 posts pour Winwin
    INSERT INTO posts (user_id, content, sport, match_teams, prediction_text, analysis, confidence, odds, created_at) VALUES
    (winwin_id, '🎯 PICK DU JOUR: Arsenal vs Spurs', 'Football', 'Arsenal FC vs Tottenham Hotspur FC', 'Double Chance 1X', 'Derby de Londres toujours imprévisible ! Arsenal favori mais Tottenham peut résister. Sécurisons avec la double chance.', 88, 1.25, now() - interval '2 hours 3 minutes'),
    (winwin_id, '💎 PÉPITE: Frosinone vs Casarano', 'Football', 'Frosinone Calcio vs S.S.D. Casarano Calcio', '1 + Handicap -1.5', 'Frosinone largement supérieur. Devrait s''imposer avec au moins 2 buts d''écart minimum.', 92, 1.31, now() - interval '1 hour 48 minutes'),
    (winwin_id, '⚡ FLASH: AS Rome écrase Cannes', 'Football', 'AS Rome vs Cannes', '1 + Plus de 2.5 buts Rome', 'La Roma va faire le spectacle devant ses fans. Cannes va subir toute la rencontre.', 94, 1.08, now() - interval '1 hour 33 minutes'),
    (winwin_id, '🔒 VERROU: Big Bullets gagnant', 'Football', 'Ekwendeni Hammers FC vs Big Bullets', '2 (Big Bullets)', 'L''équipe la plus titrée du Malawi face à Ekwendeni. Aucun doute sur l''issue du match.', 83, 1.46, now() - interval '1 hour 18 minutes'),
    (winwin_id, '🏆 ROYAL: Mohun Bagan à domicile', 'Football', 'Mohun Bagan Super Giant vs Mohammedan SC', '1 + Plus de 1.5 buts', 'Mohun Bagan, géant indien à domicile face à Mohammedan. Victoire avec buts au programme.', 85, 1.34, now() - interval '1 hour 3 minutes'),
    (winwin_id, '🎪 SHOW: Spartak Trnava qualifié', 'Football', 'Spartak Trnava vs Hibernians FC', '1 + Moins de 4.5 buts', 'Spartak va gérer sans forcer. Qualification acquise dès l''aller mais sans excès.', 89, 1.18, now() - interval '48 minutes'),
    (winwin_id, '🚀 FUSÉE: Austria Vienne décolle', 'Football', 'FC Spaeri vs Austria Vienne', '2 + Plus de 1.5 buts Austria', 'Austria Vienne, club historique autrichien. Va s''imposer nettement en Estonie.', 91, 1.25, now() - interval '33 minutes'),
    (winwin_id, '💪 POWER: Rosenborg en force', 'Football', 'FK Banga Gargzdai vs Rosenborg BK', '2 + Double Chance X2', 'Rosenborg ne peut pas se rater face à Banga. Au minimum le nul, plus probablement la victoire.', 87, 1.34, now() - interval '18 minutes'),
    (winwin_id, '🎯 PRÉCISION: HJK Helsinki efficace', 'Football', 'HJK Helsinki vs FC Arda Kardzhali', '1 + Les deux équipes marquent NON', 'HJK solide à domicile. Arda aura du mal à marquer en Finlande.', 82, 1.67, now() - interval '9 minutes'),
    (winwin_id, '🔥 FINAL: AZ Alkmaar atomise', 'Football', 'AZ Alkmaar vs Ilves Tampere', '1 + Plus de 3.5 buts AZ', 'AZ peut cartonner à domicile. Ilves va prendre une correction aux Pays-Bas.', 93, 1.11, now() - interval '1 minute');

    -- Créer 10 posts pour Patrickprono
    INSERT INTO posts (user_id, content, sport, match_teams, prediction_text, analysis, confidence, odds, created_at) VALUES
    (patrick_id, 'PATRICK ANALYSE: Arsenal - Tottenham 🧠', 'Football', 'Arsenal FC vs Tottenham Hotspur FC', 'Plus de 2.5 buts', 'Ces deux équipes nous ont habitués à des matches spectaculaires. Goals attendus des deux côtés !', 80, 1.85, now() - interval '2 hours 7 minutes'),
    (patrick_id, 'CERTITUDE PATRICK: AS Rome dominant 👑', 'Football', 'AS Rome vs Cannes', '1 + Handicap -2.5', 'La Roma va faire une démonstration face à Cannes. Écart de plusieurs buts attendu.', 96, 1.08, now() - interval '1 hour 52 minutes'),
    (patrick_id, 'INTUITION PATRICK: Levante surprise 💡', 'Football', 'Al-Qadisiya vs Levante UD', '2 (Levante victoire)', 'Levante a l''expérience européenne. Peut créer la surprise face à Al-Qadisiya.', 70, 2.08, now() - interval '1 hour 37 minutes'),
    (patrick_id, 'CONVICTION PATRICK: Big Bullets référence 🎖️', 'Football', 'Ekwendeni Hammers FC vs Big Bullets', '2 + Plus de 2.5 buts', 'Big Bullets, l''équipe de référence du Malawi. Va s''imposer avec panache.', 86, 1.46, now() - interval '1 hour 22 minutes'),
    (patrick_id, 'ÉVIDENCE PATRICK: Mohun Bagan maître 🏛️', 'Football', 'Mohun Bagan Super Giant vs Mohammedan SC', '1 + Moins de 3.5 buts', 'Mohun Bagan va contrôler le match à domicile. Victoire maîtrisée sans excès.', 88, 1.34, now() - interval '1 hour 7 minutes'),
    (patrick_id, 'ASSURANCE PATRICK: Spartak qualifié 🛡️', 'Football', 'Spartak Trnava vs Hibernians FC', '1 + Plus de 1.5 buts Spartak', 'Spartak Trnava trop fort pour Hibernians. Qualification sans suspense.', 90, 1.18, now() - interval '52 minutes'),
    (patrick_id, 'LOGIQUE PATRICK: Austria écrase 🏗️', 'Football', 'FC Spaeri vs Austria Vienne', '2 + Plus de 2.5 buts Austria', 'Austria Vienne va faire le spectacle en Estonie. Différence de niveau énorme.', 92, 1.25, now() - interval '37 minutes'),
    (patrick_id, 'RÉALISME PATRICK: Rosenborg supérieur 📊', 'Football', 'FK Banga Gargzdai vs Rosenborg BK', '2 + Moins de 4.5 buts', 'Rosenborg classe au-dessus. Victoire nette mais contrôlée face à Banga.', 84, 1.34, now() - interval '22 minutes'),
    (patrick_id, 'EXPÉRIENCE PATRICK: HJK à domicile 🏠', 'Football', 'HJK Helsinki vs FC Arda Kardzhali', '1 + Double Chance 1X', 'HJK connaît l''Europe. À domicile face à Arda, au minimum le nul est acquis.', 81, 1.45, now() - interval '11 minutes'),
    (patrick_id, 'FINALITÉ PATRICK: AZ Alkmaar royal 👑', 'Football', 'AZ Alkmaar vs Ilves Tampere', '1 + Plus de 2.5 buts match', 'AZ va régaler à domicile. Match spectaculaire attendu face à Ilves Tampere.', 89, 1.11, now() - interval '30 seconds');

    -- Créer 10 posts pour Pronosur
    INSERT INTO posts (user_id, content, sport, match_teams, prediction_text, analysis, confidence, odds, created_at) VALUES
    (pronosur_id, 'PRONOSUR PREMIUM: Derby londonien 🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Football', 'Arsenal FC vs Tottenham Hotspur FC', 'Les deux équipes marquent', 'Arsenal vs Tottenham, toujours du spectacle ! Les deux attaques vont faire parler la poudre.', 85, 1.75, now() - interval '2 hours 9 minutes'),
    (pronosur_id, 'SÉCURITÉ PRONOSUR: Frosinone bulldozer 🚜', 'Football', 'Frosinone Calcio vs S.S.D. Casarano Calcio', '1 + Plus de 1.5 buts Frosinone', 'Frosinone évoluant à un niveau supérieur va dominer Casarano. Au moins 2 buts attendus.', 93, 1.31, now() - interval '1 hour 54 minutes'),
    (pronosur_id, 'OPPORTUNITÉ PRONOSUR: Lecce vs UAE 🇮🇹', 'Football', 'US Lecce vs Emirats Arabes Unis', '1 + Moins de 3.5 buts', 'Lecce à domicile face aux Emirats. Victoire italienne maîtrisée sans excès.', 77, 1.51, now() - interval '1 hour 39 minutes'),
    (pronosur_id, 'ÉVIDENCE PRONOSUR: AS Rome carnival 🎭', 'Football', 'AS Rome vs Cannes', '1 + Plus de 3.5 buts Rome', 'La Roma va faire un festival offensif face à Cannes. Démonstration attendue.', 95, 1.08, now() - interval '1 hour 24 minutes'),
    (pronosur_id, 'DOMINATION PRONOSUR: Big Bullets 💥', 'Football', 'Ekwendeni Hammers FC vs Big Bullets', '2 + Handicap -1', 'Big Bullets, référence absolue au Malawi. Va s''imposer avec autorité.', 87, 1.46, now() - interval '1 hour 9 minutes'),
    (pronosur_id, 'MAÎTRISE PRONOSUR: Mohun Bagan 🏛️', 'Football', 'Mohun Bagan Super Giant vs Mohammedan SC', '1 + Plus de 1.5 buts Mohun', 'Mohun Bagan à domicile face à Mohammedan. Victoire avec au moins 2 buts.', 89, 1.34, now() - interval '54 minutes'),
    (pronosur_id, 'QUALIFICATION PRONOSUR: Spartak 🎫', 'Football', 'Spartak Trnava vs Hibernians FC', '1 + Double Chance 1X', 'Spartak Trnava ne peut pas rater cette qualification face à Hibernians.', 91, 1.18, now() - interval '39 minutes'),
    (pronosur_id, 'ÉCRASEMENT PRONOSUR: Austria 🇦🇹', 'Football', 'FC Spaeri vs Austria Vienne', '2 + Plus de 2.5 buts match', 'Austria Vienne classe internationale face à Spaeri. Match à sens unique.', 94, 1.25, now() - interval '24 minutes'),
    (pronosur_id, 'EXPÉRIENCE PRONOSUR: Rosenborg 🇳🇴', 'Football', 'FK Banga Gargzdai vs Rosenborg BK', '2 + Les deux équipes marquent NON', 'Rosenborg solide défensivement. Victoire sans encaisser face à Banga.', 86, 1.34, now() - interval '13 minutes'),
    (pronosur_id, 'FINALE PRONOSUR: AZ destruction 💥', 'Football', 'AZ Alkmaar vs Ilves Tampere', '1 + Handicap -2', 'AZ Alkmaar va détruire Ilves à domicile. Écart de plusieurs buts attendu.', 92, 1.11, now() - interval '2 minutes');

END $$;