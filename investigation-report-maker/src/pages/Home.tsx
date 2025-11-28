import { Person } from "@mui/icons-material";
import ArticleIcon from "@mui/icons-material/Article";
import DescriptionIcon from "@mui/icons-material/Description";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import {
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
  Box
} from "@mui/material";
import * as React from "react";
import { useNavigate } from "react-router-dom";

/**
 * Home screen (flex layout):
 * - Uses flexbox to occupy most of the viewport.
 * - Cards grow/shrink responsively and remain keyboard-accessible.
 */
const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Stack spacing={3} sx={{ minHeight: "80vh", py: 2 }}>
      {/* Card Row */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "stretch",
          justifyContent: { xs: "stretch", sm: "center" }
        }}
      >
        {/* Template Creation */}
        <Card
          variant="outlined"
          sx={{
            border: 1,
            borderColor: "divider",
            flex: "1 1 420px", // base width; grows to fill space
            maxWidth: 720, // keep lines readable on wide screens
            minHeight: 160,
            display: "flex"
          }}
        >
          <CardActionArea
            onClick={() => navigate("/templates/new")}
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch"
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <DescriptionIcon fontSize="large" color="primary" />
                <Stack>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Template Creation
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Start a new document template with styled placeholders.
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </CardActionArea>
        </Card>

        {/* Report Creation */}
        <Card
          variant="outlined"
          sx={{
            border: 1,
            borderColor: "divider",
            flex: "1 1 420px",
            maxWidth: 720,
            minHeight: 160,
            display: "flex"
          }}
        >
          <CardActionArea
            onClick={() => navigate("/reports/new")}
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch"
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <ArticleIcon fontSize="large" color="primary" />
                <Stack>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Report Creation
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Draft a report using your preferred layout and sections.
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </CardActionArea>
        </Card>

        {/* Police Officer Management */}
        <Card
          variant="outlined"
          sx={{
            border: 1,
            borderColor: "divider",
            flex: "1 1 420px",
            maxWidth: 720,
            minHeight: 160,
            display: "flex"
          }}
        >
          <CardActionArea
            onClick={() => navigate("/police-officer-management")}
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch"
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Person fontSize="large" color="primary" />
                <Stack>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Manage Police Officers
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage and track police officers and their assignments.
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </CardActionArea>
        </Card>

        {/* Police Station Management */}
        <Card
          variant="outlined"
          sx={{
            border: 1,
            borderColor: "divider",
            flex: "1 1 420px",
            maxWidth: 720,
            minHeight: 160,
            display: "flex"
          }}
        >
          <CardActionArea
            onClick={() => navigate("/police-station-management")}
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch"
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <LocationCityIcon fontSize="large" color="primary" />
                <Stack>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Manage Police Station
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage and maintain police station details.
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </CardActionArea>
        </Card>
      </Box>
    </Stack>
  );
};

export default Home;
