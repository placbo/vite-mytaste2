import { Alert, Button, Card, CardContent, CardHeader, CardMedia, Container, Grid, Typography } from '@mui/material';
import { FC, useContext, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { axiosPostHandler } from '../api/apiUtils';
import { AuthContext } from '../App';
import { AddImageComponent } from '../components/AddImageComponent';
import { ItemForm, ItemFormFields } from '../components/ItemForm';
import { ITEMS_URL, THUMBNAIL_URL } from '../constants';
import placeholderItemImage from '../resources/images/placeholder.png';
import { ISaveItemResponse, Item, Review } from '../types';

export const AddNewItemPage: FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [saveImageError, setSaveImageError] = useState<Error | undefined>(undefined);
  const [saveImageSuccess, setSaveImageSuccess] = useState<boolean>(false);
  const [savingError, setSavingError] = useState<Error | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  const [newItemId, setNewItemId] = useState<string | undefined>(undefined);
  const [imageFileName, setImageFileName] = useState<string | undefined>(undefined);

  const saveForm = async (dataFromForm: ItemFormFields) => {
    const itemObjectToSave: Item = {
      title: dataFromForm.title,
      description: dataFromForm.description ?? '',
      creator: user,
    };
    const saveItemResult: ISaveItemResponse = await axiosPostHandler(
      `${ITEMS_URL}`,
      itemObjectToSave,
      setSavingError,
      setIsSaving
    );
    const resultItemId = saveItemResult.id;

    const tagsList = dataFromForm.tags.split(',');
    await axiosPostHandler(`${ITEMS_URL}/${resultItemId}/tags`, { tags: tagsList }, setSavingError, setIsSaving);

    const rewiewToSave: Review = { comment: dataFromForm.review ?? '', user: user, rating: dataFromForm.rating ?? 0 };
    await axiosPostHandler(`${ITEMS_URL}/${resultItemId}/reviews`, rewiewToSave, setSavingError, setIsSaving);

    setNewItemId(resultItemId);
  };

  return (
    <Container maxWidth="sm">
      {savingError && (
        <Alert sx={{ m: 2 }} severity="error">
          Lagring av data gikk gæli!
        </Alert>
      )}

      <Card sx={{ m: 2 }}>
        <CardHeader title={'Legg til ny: '}></CardHeader>

        <CardContent>
          <ItemForm isSaving={isSaving} saveForm={saveForm} isDisabled={!!newItemId} />
        </CardContent>
        <CardContent>
          <Typography component="legend">Bilde</Typography>

          {imageFileName ? (
            <CardMedia
              component="img"
              sx={{ maxWidth: 150 }}
              image={imageFileName ? `${THUMBNAIL_URL}${imageFileName}` : placeholderItemImage}
              alt="image"
            />
          ) : (
            <AddImageComponent
              itemId={newItemId}
              setError={setSaveImageError}
              setSuccess={setSaveImageSuccess}
              imageFileName={imageFileName}
              setImageFileName={setImageFileName}></AddImageComponent>
          )}

          {saveImageError && <Alert severity="error">{'Kunne ikke lagre bilde'}</Alert>}
          {saveImageSuccess && <Alert severity="success">{'Bildet ble lagret'}</Alert>}

          <Grid container justifyContent="right" sx={{ mt: 4 }}>
            <Grid item>
              <Button
                variant="contained"
                color="secondary"
                sx={{ ml: 2 }}
                onClick={() => {
                  navigate('/');
                }}>
                {'Lukk'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};