import {
  Alert,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  TextField,
} from '@mui/material';
import { useCallback, useRef, useState } from 'react';

function App() {
  const [jsonError, setJsonError] = useState(false);
  const [open, setOpen] = useState(false);
  const textElement = useRef();
  const isReverseInputElement = useRef();
  const alertTimer = useRef();

  const handleFocusCapture = useCallback(() => {
    setJsonError(false);
  }, []);

  const handleConvert = useCallback(async () => {
    try {
      const stringJSON = textElement.current.value;
      const {
        data: { battle_list: data },
      } = JSON.parse(stringJSON);
      const stringList = data.map(
        ({ order_num, user_name, total_damage }) =>
          `${order_num}\t${user_name}\t${total_damage}`
      );
      const reversed = isReverseInputElement.current.checked;
      const text = (reversed ? stringList.reverse() : stringList).join('\n');
      await navigator.clipboard.writeText(text);
      textElement.current.value = '';
      if (alertTimer.current) {
        clearTimeout(alertTimer.current);
      }
      setOpen(true);
      alertTimer.current = setTimeout(() => {
        setOpen(false);
        alertTimer.current = undefined;
      }, 3000);
    } catch (error) {
      if (error instanceof SyntaxError) {
        setJsonError(true);
        return;
      }

      console.error(error);
    }
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <Container>
      <Card sx={{ mx: 'auto', my: 2, maxWidth: 'md' }}>
        <CardContent>
          <TextField
            inputRef={textElement}
            label="JSON"
            fullWidth
            multiline
            minRows={10}
            maxRows={10}
            autoFocus
            error={jsonError}
            helperText={jsonError && 'JSON 파싱 오류'}
            onFocusCapture={handleFocusCapture}
          />
          <Grid container sx={{ mt: 1 }}>
            <Grid item xs={4}></Grid>
            <Grid item xs={4} sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                sx={{ mx: 'auto' }}
                onClick={handleConvert}
              >
                변환 후 복사
              </Button>
            </Grid>
            <Grid item xs={4} sx={{ pr: 1, textAlign: 'right' }}>
              <FormControlLabel
                inputRef={isReverseInputElement}
                control={<Checkbox defaultChecked />}
                label="순서 뒤집기"
                labelPlacement="start"
              />
            </Grid>
          </Grid>
          {open && (
            <Alert
              onClose={handleClose}
              severity="success"
              sx={{ mt: 1, maxWidth: 'md' }}
            >
              복사되었습니다.
            </Alert>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}

export default App;
