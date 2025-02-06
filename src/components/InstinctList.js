// ...existing code...

const InstinctList = ({
  title,
  instincts,
  selectedInstinct,
  handleInstinctChange,
  onAssimilatedRoll,
  id,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedInstinctKey, setSelectedInstinctKey] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedValues, setEditedValues] = useState({});

  const handleInstinctClick = (instinctKey) => {
    setSelectedInstinctKey(instinctKey);
    setOpen(true);
  };

  const getInstinctDescription = (key) => {
    const descriptions = {
      reaction:
        "Instinto básico que mede a velocidade de reação do indivíduo. Geralmente, é usado em situações em que o personagem está em risco e precisa agir rapidamente ou em testes reflexivos em geral.",
      perception:
        " Governa a capacidade sensorial do personagem, incluindo todos os sentidos e a atenção.",
      sagacity:
        " Facilidade para entender e interpretar dados, explicações ou situações; agudeza de espírito; perspicácia, argúcia, astúcia.",
      potency:
        "Capacidade de exercer pressão física do personagem, incluindo resistência a pressões físicas externas. Mede seu poder físico e elasticidade, relacionando seu sistema nervoso central com seu sistema muscular e ósseo.",
      influence:
        "Sua capacidade de influenciar outras pessoas, seu magnetismo pessoal, carisma, escolha e cuidado com palavras e liderança.",
      resolution:
        "Sua determinação física e mental, capacidade de resistir à pressão psicológica interna e externa.",
    };
    return descriptions[key] || "Descrição não disponível.";
  };

  const toggleEditMode = () => {
    if (editMode) {
      const updatedInstincts = {};

      Object.keys(editedValues).forEach((instinctKey) => {
        if (instincts[instinctKey] !== undefined) {
          updatedInstincts[instinctKey] = parseInt(
            editedValues[instinctKey],
            10
          );
        }
      });

      if (id) {
        handleInstinctChange(updatedInstincts);
      } else {
        console.error("ID do personagem está indefinido");
      }
    } else {
      setEditMode(true);
    }
  };

  const handleEditedValueChange = (instinctKey, value) => {
    setEditedValues((prev) => ({
      ...prev,
      [instinctKey]: value,
    }));
  };

  return (
    <Box>
      <Typography variant="h6">{translateKey(title)}</Typography>
      <Button
        variant="contained"
        color={editMode ? "secondary" : "primary"}
        onClick={toggleEditMode}
        sx={{ padding: "4px", minWidth: "unset" }}
      >
        <EditIcon />
      </Button>

      {Object.entries(instincts).map(([key, value]) => (
        <Grid container key={key} spacing={3} alignItems="center">
          <Grid item xs={4} sm={3}>
            <Typography
              onClick={() => handleInstinctClick(key)}
              sx={{
                cursor: "pointer",
                color: "text.primary",
                "&:hover": { color: "primary.main" },
              }}
            >
              {translateKey(key)} {/* Aplica a tradução usando translateKey */}
            </Typography>
          </Grid>

          <Grid item xs={4} sm={2}>
            {editMode ? (
              <TextField
                value={editedValues[key] || value}
                onChange={(e) => handleEditedValueChange(key, e.target.value)}
                size="small"
                variant="outlined"
                fullWidth
                inputProps={{
                  style: { textAlign: "center" },
                }}
              />
            ) : (
              <Typography>{value}</Typography>
            )}
          </Grid>

          <Grid item xs={4} sm={3}>
            <FormControl
              variant="outlined"
              margin="dense"
              size="small"
              fullWidth
              sx={{ minWidth: 100 }}
            >
              <InputLabel>{translateKey("Instincts")}</InputLabel>
              <Select
                label={translateKey("Instincts")}
                value={selectedInstinct[key] || ""}
                onChange={(e) => handleInstinctChange(key, e.target.value)}
              >
                {Object.keys(instincts).map((instinctKey) => (
                  <MenuItem key={instinctKey} value={instinctKey}>
                    {translateKey(instinctKey)} {/* Aplica a tradução */}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={4} sm={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => onAssimilatedRoll(key, selectedInstinct[key])}
              fullWidth
              sx={{ marginLeft: "28px" }}
            >
              <MeuIcone2 style={{ width: "24px", height: "24px" }} />
            </Button>
          </Grid>
        </Grid>
      ))}

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>
          {selectedInstinctKey &&
            selectedInstinctKey.charAt(0).toUpperCase() +
              selectedInstinctKey.slice(1)}
        </DialogTitle>
        <DialogContent>
          <Typography>{getInstinctDescription(selectedInstinctKey)}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            {translateKey("Fechar")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ...existing code...
