import React from "react";
import { motion } from "framer-motion";
import { Target, Shirt, TrendingUp } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ProgressBar from "../ui/ProgressBar";

const PropCard = ({ player, selectedTab }) => {
  const getPositionColor = (position) => {
    switch (position) {
      case "QB":
        return "bg-red-500";
      case "RB":
        return "bg-blue-500";
      case "WR":
        return "bg-green-500";
      case "TE":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-gray-800 to-gray-900 text-white overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Avatar className="w-16 h-16 border-2 border-white shadow-lg">
            <AvatarImage
              src={player.nfl_players?.headshot_url}
              alt={player.nfl_players?.player_name || "Player"}
              className="object-cover"
            />
            <AvatarFallback
              className={`${getPositionColor(
                player.position
              )} text-white text-2xl font-bold`}
            >
              {player.nfl_players?.player_name?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{player.player_name}</h2>
            <span className="text-sm text-gray-300 flex items-center">
              <span
                className={`w-2 h-2 rounded-full ${getPositionColor(
                  player.position
                )} mr-2`}
              ></span>
              {player.position} - {player.team}
            </span>
          </div>
        </div>
        {selectedTab === "Season Long" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {player.passing_yards_progress !== null && (
              <ProgressBar
                label="Passing Yards"
                current={player.passing_yards}
                total={player.passing_yards_over_under}
              />
            )}
            {player.passing_tds_progress !== null && (
              <ProgressBar
                label="Passing TDs"
                current={player.passing_tds}
                total={player.passing_tds_over_under}
                icon={Target}
              />
            )}
            {player.receiving_yards_progress !== null && (
              <ProgressBar
                label="Receiving Yards"
                current={player.receiving_yards}
                total={player.receiving_yards_over_under}
                icon={Shirt}
              />
            )}
            {player.receiving_tds_progress !== null && (
              <ProgressBar
                label="Receiving TDs"
                current={player.receiving_tds}
                total={player.receiving_tds_over_under}
                icon={Target}
              />
            )}
            {player.rushing_yards_progress !== null && (
              <ProgressBar
                label="Rushing Yards"
                current={player.rushing_yards}
                total={player.rushing_yards_over_under}
              />
            )}
            {player.rushing_tds_progress !== null && (
              <ProgressBar
                label="Rushing TDs"
                current={player.rushing_tds}
                total={player.rushing_tds_over_under}
                icon={Target}
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {player.weekly_passing_props && (
              <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
                  Passing Props
                </h3>
                {/* Render weekly passing props here */}
              </div>
            )}
            {player.weekly_receiving_props && (
              <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
                  <Shirt className="w-4 h-4 mr-2" />
                  Receiving Props
                </h3>
                {/* Render weekly receiving props here */}
              </div>
            )}
            {player.weekly_rushing_props && (
              <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
                  Rushing Props
                </h3>
                {/* Render weekly rushing props here */}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default PropCard;
