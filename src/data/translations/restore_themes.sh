#!/bin/bash

# Restore correct theme names for all languages
declare -A theme_names

# English (base)
theme_names["en_uprising"]="Classic"
theme_names["en_ocean"]="Ocean"
theme_names["en_forest"]="Forest"
theme_names["en_sunset"]="Earth"
theme_names["en_purple"]="Purple"
theme_names["en_minimalist"]="Minimalist"

# Turkish
theme_names["tr_uprising"]="Klasik"
theme_names["tr_ocean"]="Okyanus"
theme_names["tr_forest"]="Orman"
theme_names["tr_sunset"]="Dünya"
theme_names["tr_purple"]="Mor"
theme_names["tr_minimalist"]="Minimalist"

# German
theme_names["de_uprising"]="Uprising"
theme_names["de_ocean"]="Ozean"
theme_names["de_forest"]="Wald"
theme_names["de_sunset"]="Erde"
theme_names["de_purple"]="Lila"
theme_names["de_minimalist"]="Minimalistisch"

# Spanish
theme_names["es_uprising"]="Clásico"
theme_names["es_ocean"]="Océano"
theme_names["es_forest"]="Bosque"
theme_names["es_sunset"]="Tierra"
theme_names["es_purple"]="Púrpura"
theme_names["es_minimalist"]="Minimalista"

# French
theme_names["fr_uprising"]="Classique"
theme_names["fr_ocean"]="Océan"
theme_names["fr_forest"]="Forêt"
theme_names["fr_sunset"]="Terre"
theme_names["fr_purple"]="Violet"
theme_names["fr_minimalist"]="Minimaliste"

# Italian
theme_names["it_uprising"]="Classico"
theme_names["it_ocean"]="Oceano"
theme_names["it_forest"]="Foresta"
theme_names["it_sunset"]="Terra"
theme_names["it_purple"]="Viola"
theme_names["it_minimalist"]="Minimalista"

# Portuguese
theme_names["pt_uprising"]="Clássico"
theme_names["pt_ocean"]="Oceano"
theme_names["pt_forest"]="Floresta"
theme_names["pt_sunset"]="Terra"
theme_names["pt_purple"]="Roxo"
theme_names["pt_minimalist"]="Minimalista"

# Dutch
theme_names["nl_uprising"]="Klassiek"
theme_names["nl_ocean"]="Oceaan"
theme_names["nl_forest"]="Bos"
theme_names["nl_sunset"]="Aarde"
theme_names["nl_purple"]="Paars"
theme_names["nl_minimalist"]="Minimalistisch"

# Russian
theme_names["ru_uprising"]="Классика"
theme_names["ru_ocean"]="Океан"
theme_names["ru_forest"]="Лес"
theme_names["ru_sunset"]="Земля"
theme_names["ru_purple"]="Фиолетовый"
theme_names["ru_minimalist"]="Минимализм"

# Japanese
theme_names["ja_uprising"]="クラシック"
theme_names["ja_ocean"]="オーシャン"
theme_names["ja_forest"]="フォレスト"
theme_names["ja_sunset"]="地球"
theme_names["ja_purple"]="パープル"
theme_names["ja_minimalist"]="ミニマリスト"

# Indonesian
theme_names["id_uprising"]="Klasik"
theme_names["id_ocean"]="Samudera"
theme_names["id_forest"]="Hutan"
theme_names["id_sunset"]="Bumi"
theme_names["id_purple"]="Ungu"
theme_names["id_minimalist"]="Minimalis"

# Thai
theme_names["th_uprising"]="คลาสสิก"
theme_names["th_ocean"]="มหาสมุทร"
theme_names["th_forest"]="ป่าไม้"
theme_names["th_sunset"]="โลก"
theme_names["th_purple"]="สีม่วง"
theme_names["th_minimalist"]="มินิมอล"

# Malay
theme_names["ms_uprising"]="Klasik"
theme_names["ms_ocean"]="Lautan"
theme_names["ms_forest"]="Hutan"
theme_names["ms_sunset"]="Bumi"
theme_names["ms_purple"]="Ungu"
theme_names["ms_minimalist"]="Minimalis"

for file in *.json; do
  lang=${file%.json}
  echo "Restoring $file..."
  
  for theme in uprising ocean forest sunset purple minimalist; do
    key="${lang}_${theme}"
    name="${theme_names[$key]}"
    if [ -n "$name" ]; then
      sed -i '' "s/\"$theme\": {[^}]*\"name\": \"[^\"]*\"/\"$theme\": {\n      \"name\": \"$name\"/g" "$file"
    fi
  done
done

echo "Theme restoration completed!"
