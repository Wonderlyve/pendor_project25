-- Insertion des 5 posts de paris combinés pour les utilisateurs existants
INSERT INTO posts (user_id, content, sport, match_teams, prediction_text, analysis, odds, confidence, likes, comments, shares, views) VALUES 
-- Post 1 - Patrickprono
('f422d028-08c7-49cf-b4ad-02ed5b4bb0b6', 
 'Combiné 5 matchs européens - Journée du 1er août 2025', 
 'Football', 
 'Slovan Bratislava Youth vs Petrzalka + Sparta Brno vs Pelhřimov + BATE Borisov vs FK Vitebsk + NK Radomlje vs NK Domzale + Rekord Bielsko-Biala vs NKP Podhale', 
 'Combiné 5 selections: 1 + N + 1 + 1 + 1', 
 'Excellente opportunité avec ce combiné 5 matchs du 1er août. Slovan Youth dominant à domicile (2.45), match nul probable entre Sparta Brno et Pelhřimov, BATE solide face à Vitebsk (2.18), Radomlje favori logique (2.25), et Rekord qui devrait s''imposer (3.44). Cote totale attractive de 54.32 !', 
 54.32, 
 82, 0, 0, 0, 0),

-- Post 2 - Winwin  
('8c3c3412-3a8e-40a9-aa6f-8284687ec36b', 
 'Combiné Finlande + République Tchèque - 4 sélections premium', 
 'Football', 
 'JS Hercules vs JBK Pietarsaari + VIFK Vaasa vs GBK Kokkola + Fotbal Trinec vs Hlubina + FK Blansko vs Start Brno', 
 'Combiné 4 matchs: 1 + 1 + 1 + N', 
 'Mise sur les favoris finlandais et tchèques pour ce 1er août. Hercules en excellente forme (1.44), Vaasa dominateur chez eux (1.55), Trinec très solide à domicile (1.22), et match équilibré Blansko-Start justifiant le nul (2.25). Combiné sécurisé avec belle cote finale.', 
 11.58, 
 78, 0, 0, 0, 0),

-- Post 3 - VictoirePro
('8f2d6eb7-f908-43ae-839e-19c1275caa1c', 
 'Combiné Premium - 3 matchs sélectionnés', 
 'Football', 
 'FC Jazz vs Inter Turku II + Zaglebie Lubin vs Korona Kielce + Troszyn vs Wisła Płock II', 
 'Combiné 3 selections: 1 + 1 + 1', 
 'Triple gagnant avec Jazz favori en Finlande face à Inter Turku II (2.10), Zaglebie qui doit s''imposer face à Korona à domicile (2.20), et Troszyn bien avantagé contre Wisła II (3.50). Confiance maximale sur ces 3 pronos du 1er août.', 
 16.17, 
 85, 0, 0, 0, 0),

-- Post 4 - Starwin
('a16d6472-76b1-4ea9-8f9d-dbe5b5ccb41e', 
 'Combiné International - 4 pays, 4 victoires', 
 'Football', 
 'FC Fredericia vs København + Spartak Varna vs Botev Vratsa + Farul Constanta vs CS Metaloglobus + Kapfenberg vs Admira', 
 'Combiné 4 sélections: 2 + N + 1 + 1', 
 'Combiné cross-européen du 1er août : København s''impose au Danemark contre Fredericia (1.42), nul probable en Bulgarie entre Spartak Varna et Botev Vratsa (2.30), Farul favorite en Roumanie face à Metaloglobus (1.33), et Kapfenberg qui doit battre Admira en Autriche (1.75). Analyse technique poussée.', 
 9.33, 
 80, 0, 0, 0, 0),

-- Post 5 - Patrickprono (deuxième post)
('f422d028-08c7-49cf-b4ad-02ed5b4bb0b6', 
 'Super Combiné Allemagne - 6 matchs Regionalliga', 
 'Football', 
 'Meppen vs VfB Lubeck + SV Sandhausen vs FSV Frankfurt + Lokomotive Leipzig vs VSG Altglienicke + BFC Dynamo vs RW Erfurt + Carl Zeiss Jena vs Hertha BSC II + Bayern Munich II vs TSV Buchbach', 
 'Combiné 6 matchs: 1 + 1 + 1 + 1 + 1 + 1', 
 'Mega combiné Allemagne 4ème division du 1er août ! Meppen solide à domicile (4.75), Sandhausen avec son expérience (3.40), Leipzig locomotive sur son terrain (3.40), Dynamo Berlin avec la motivation (2.55), Jena face aux jeunes d''Hertha II (1.36), et Bayern II qui reste sur une belle série. Gros potentiel de gain !', 
 845.67, 
 90, 0, 0, 0, 0);