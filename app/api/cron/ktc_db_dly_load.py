import os
from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client
from datetime import date

# Load environment variables
load_dotenv()

# Supabase credentials
url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

# Ensure that the environment variables are set
if not url or not key:
    raise ValueError("Supabase URL or key not found in environment variables")

supabase: Client = create_client(url, key)

def scrape_ktc(scrape_redraft=False):
    # universal vars
    URL = "https://keeptradecut.com/dynasty-rankings?page={0}&filters=QB|WR|RB|TE|RDP&format={1}"
    all_elements = []
    players = []

    for format in [1, 0]:
        if format == 1:
            for page in tqdm(range(10), desc="Linking to keeptradecut.com's 1QB rankings...", unit="page"):
                page = requests.get(URL.format(page, format))
                soup = BeautifulSoup(page.content, "html.parser")
                player_elements = soup.find_all(class_="onePlayer")
                for player_element in player_elements:
                    all_elements.append(player_element)

            for player_element in all_elements:
                player_name_element = player_element.find(class_="player-name")
                player_position_element = player_element.find(class_="position")
                player_value_element = player_element.find(class_="value")
                player_age_element = player_element.find(class_="position hidden-xs")

                player_name = player_name_element.get_text(strip=True)
                team_suffix = (player_name[-3:] if player_name[-3:] == 'RFA' else player_name[-4:] if player_name[-4] == 'R' else player_name[-2:] if player_name[-2:] == 'FA' else player_name[-3:] if player_name[-3:].isupper() else "")

                player_name = player_name.replace(team_suffix, "").strip()
                player_position_rank = player_position_element.get_text(strip=True)
                player_value = player_value_element.get_text(strip=True)
                player_value = int(player_value)
                player_position = player_position_rank[:2]

                if player_age_element:
                    player_age_text = player_age_element.get_text(strip=True)
                    player_age = float(player_age_text[:4]) if player_age_text else 0
                else:
                    player_age = 0

                if team_suffix[0] == 'R':
                    player_team = team_suffix[1:]
                    player_rookie = "Yes"
                else:
                    player_team = team_suffix
                    player_rookie = "No"

                first_name, last_name = split_name(player_name)

                if player_position == "PI":
                    pick_info = {
                        "first_name": first_name,
                        "last_name": last_name,
                        "player_name": player_name,
                        "position_rank": None,
                        "position": player_position,
                        "team": None,
                        "value": player_value,
                        "age": None,
                        "rookie": None,
                        "sf_position_rank": None,
                        "sf_value": 0,
                        "rdrft_position_rank": None,
                        "rdrft_value": 0,
                        "sfrdrft_position_rank": None,
                        "sfrdrft_value": 0,
                        "date": date.today().strftime('%Y-%m-%d')
                    }
                    players.append(pick_info)
                else:
                    player_info = {
                        "first_name": first_name,
                        "last_name": last_name,
                        "player_name": player_name,
                        "position_rank": player_position_rank,
                        "position": player_position,
                        "team": player_team,
                        "value": player_value,
                        "age": player_age,
                        "rookie": player_rookie,
                        "sf_position_rank": None,
                        "sf_value": 0,
                        "rdrft_position_rank": None,
                        "rdrft_value": 0,
                        "sfrdrft_position_rank": None,
                        "sfrdrft_value": 0,
                        "date": date.today().strftime('%Y-%m-%d')
                    }
                    players.append(player_info)
        else:
            for page in tqdm(range(10), desc="Linking to keeptradecut.com's Superflex rankings...", unit="page"):
                page = requests.get(URL.format(page, format))
                soup = BeautifulSoup(page.content, "html.parser")
                player_elements = soup.find_all(class_="onePlayer")
                for player_element in player_elements:
                    all_elements.append(player_element)

            for player_element in all_elements:
                player_name_element = player_element.find(class_="player-name")
                player_position_element = player_element.find(class_="position")
                player_value_element = player_element.find(class_="value")
                player_age_element = player_element.find(class_="position hidden-xs")

                player_name = player_name_element.get_text(strip=True)
                team_suffix = (player_name[-3:] if player_name[-3:] == 'RFA' else player_name[-4:] if player_name[-4] == 'R' else player_name[-2:] if player_name[-2:] == 'FA' else player_name[-3:] if player_name[-3:].isupper() else "")

                player_name = player_name.replace(team_suffix, "").strip()
                player_position_rank = player_position_element.get_text(strip=True)
                player_position = player_position_rank[:2]
                player_value = player_value_element.get_text(strip=True)
                player_value = int(player_value)

                first_name, last_name = split_name(player_name)

                if player_position == "PI":
                    for pick in players:
                        if pick["player_name"] == player_name:
                            pick["sf_value"] = player_value
                            break
                else:
                    for player in players:
                        if player["player_name"] == player_name:
                            player["sf_position_rank"] = player_position_rank
                            player["sf_value"] = player_value
                            break

    if scrape_redraft:
        players = add_redraft_values(players)

    return players

def split_name(full_name):
    parts = full_name.split(' ')
    first_name = parts[0]
    last_name = ' '.join(parts[1:]) if len(parts) > 1 else ''
    return first_name, last_name

def add_redraft_values(players):
    URL = "https://keeptradecut.com/fantasy-rankings?page={0}&filters=QB|WR|RB|TE&format={1}"
    all_elements = []

    for format in [1, 2]:
        if format == 1:
            for page in tqdm(range(10), desc="Linking to keeptradecut.com's Redraft 1QB rankings...", unit="page"):
                page = requests.get(URL.format(page, format))
                soup = BeautifulSoup(page.content, "html.parser")
                player_elements = soup.find_all(class_="onePlayer")
                for player_element in player_elements:
                    all_elements.append(player_element)

            for player_element in all_elements:
                player_name_element = player_element.find(class_="player-name")
                player_position_element = player_element.find(class_="position")
                player_value_element = player_element.find(class_="value")

                player_name = player_name_element.get_text(strip=True)
                team_suffix = (player_name[-3:] if player_name[-3:] == 'RFA' else player_name[-4:] if player_name[-4] == 'R' else player_name[-2:] if player_name[-2:] == 'FA' else player_name[-3:] if player_name[-3:].isupper() else "")

                player_name = player_name.replace(team_suffix, "").strip()
                player_position_rank = player_position_element.get_text(strip=True)
                player_value = player_value_element.get_text(strip=True)
                player_value = int(player_value)

                first_name, last_name = split_name(player_name)

                for player in players:
                    if player["player_name"] == player_name:
                        player["rdrft_position_rank"] = player_position_rank
                        player["rdrft_value"] = player_value
                        break
        else:
            for page in tqdm(range(10), desc="Linking to keeptradecut.com's Redraft Superflex rankings...", unit="page"):
                page = requests.get(URL.format(page, format))
                soup = BeautifulSoup(page.content, "html.parser")
                player_elements = soup.find_all(class_="onePlayer")
                for player_element in player_elements:
                    all_elements.append(player_element)

            for player_element in all_elements:
                player_name_element = player_element.find(class_="player-name")
                player_position_element = player_element.find(class_="position")
                player_value_element = player_element.find(class_="value")

                player_name = player_name_element.get_text(strip=True)
                team_suffix = (player_name[-3:] if player_name[-3:] == 'RFA' else player_name[-4:] if player_name[-4] == 'R' else player_name[-2:] if player_name[-2:] == 'FA' else player_name[-3:] if player_name[-3:].isupper() else "")

                player_name = player_name.replace(team_suffix, "").strip()
                player_position_rank = player_position_element.get_text(strip=True)
                player_value = player_value_element.get_text(strip=True)
                player_value = int(player_value)

                first_name, last_name = split_name(player_name)

                for player in players:
                    if player["player_name"] == player_name:
                        player["sfrdrft_position_rank"] = player_position_rank
                        player["sfrdrft_value"] = player_value
                        break

    return players

def export_to_supabase(players):
    today = date.today().strftime('%Y-%m-%d')
    for player in players:
        player["date"] = today
        try:
            # Print the player data being inserted
            print(f"Inserting player: {player}")
            response = supabase.table('ktc_test').insert(player).execute()
            print(f"Inserted player: {player['player_name']}")
        except Exception as e:
            print(f"Error inserting player: {player['player_name']}, Error: {str(e)}, Response: {response.json()}")

def main():
    update_redraft = True
    players = scrape_ktc(update_redraft)
    export_to_supabase(players)
    print("Script execution completed successfully")

if __name__ == "__main__":
    main()
