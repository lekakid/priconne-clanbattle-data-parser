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
  Typography,
} from '@mui/material';
import { useCallback, useRef, useState } from 'react';

function has3OverSameUnit(groupA, groupB) {
  let count = 0;
  groupA.forEach((unitA) => {
    if (groupB.some((unitB) => unitB.unit_id === unitA.unit_id)) count += 1;
  });

  return count > 2;
}

function App() {
  const [jsonError, setJsonError] = useState(false);
  const [open, setOpen] = useState(false);
  const [recordTime, setRecordTime] = useState({ to: 0, from: 0 });
  const textElement = useRef();
  const isReverseInputElement = useRef();
  const alertTimer = useRef();

  const handleFocusCapture = useCallback(() => {
    setJsonError(false);
  }, []);

  const handleConvert = useCallback(async () => {
    try {
      const stringJSON = textElement.current.value;
      const reversed = isReverseInputElement.current.checked;

      let {
        data: { battle_list: data },
      } = JSON.parse(stringJSON);

      data = reversed ? data.reverse() : data;
      const time = {};
      const text = data
        .map((d, i) => {
          if (i === 0) time.from = Number(d.battle_end_time) * 1000;
          if (i === data.length - 1) time.to = Number(d.battle_end_time) * 1000;

          const isCarried = data
            .filter(
              (e, j) => j < i && e.target_viewer_id === d.target_viewer_id
            )
            .some((e) => has3OverSameUnit(d.units, e.units));
          return `${d.order_num}\t${d.user_name}\t${d.total_damage}\t${isCarried}`;
        })
        .join('\n');

      setRecordTime(time);
      await navigator.clipboard.writeText(text);
      textElement.current.value = '';

      if (alertTimer.current) clearTimeout(alertTimer.current);
      setOpen(true);
      alertTimer.current = setTimeout(() => {
        setOpen(false);
        alertTimer.current = undefined;
      }, 10000);
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
              <Typography>복사되었습니다.</Typography>
              <Typography>
                {new Date(recordTime.from).toLocaleString()} ~{' '}
                {new Date(recordTime.to).toLocaleString()}
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}

export default App;
